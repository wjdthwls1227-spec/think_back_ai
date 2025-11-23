import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStart, userInfo, journalsData } = body;
    
    console.log('Weekly analyze request received:', {
      hasWeekStart: !!weekStart,
      weekStart,
      hasUserInfo: !!userInfo,
      hasJournalsData: !!journalsData,
      journalsDataCount: journalsData?.length || 0,
      journalsDataIds: journalsData?.map((j: any) => j?.id) || [],
    });
    
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // 쿠키에서 Supabase 클라이언트 생성
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // 쿠키 설정 실패는 무시 (읽기 전용)
            }
          },
        },
      }
    );
    
    // 1. 사용자 인증 확인
    let user;
    let authError;
    
    if (token) {
      // 토큰이 있으면 직접 검증
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
      
      // 토큰으로 인증한 경우, RLS를 위해 세션 설정 시도
      if (user && !tokenError) {
        // 세션을 설정하여 RLS 정책이 작동하도록 함
        try {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '', // refresh token은 필요 없음
          });
        } catch (sessionError) {
          // 세션 설정 실패는 무시 (토큰 검증은 이미 완료됨)
          console.warn('Session set warning:', sessionError);
        }
      }
    } else {
      // 토큰이 없으면 쿠키에서 확인
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      user = cookieUser;
      authError = cookieError;
    }
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', {
      userId: user.id,
      email: user.email,
    });

    // 2. 프로필에서 AI 플랜 및 어드민 권한 확인
    // 클라이언트에서 전달한 사용자 ID와 서버에서 확인한 ID 일치 확인
    if (userInfo && userInfo.id !== user.id) {
      console.error('User ID mismatch:', { clientUserId: userInfo.id, serverUserId: user.id });
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    const targetUserId = user.id;
    console.log('Fetching profile for user:', targetUserId);
    
    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_plan_until, role')
      .eq('id', targetUserId)
      .maybeSingle();
    
    let profileData = profile;
    
    // 프로필 조회 실패 시 로그 출력
    if (profileError) {
      console.error('Profile fetch error:', {
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        userId: targetUserId,
      });
    }
    
    if (!profile && !profileError) {
      console.warn('Profile not found for user:', targetUserId);
    }
    
    // 클라이언트에서 전달한 어드민 정보가 있으면 우선 사용 (프로필 조회 실패 시 대비)
    if (userInfo?.isAdmin !== undefined && (!profileData || profileError)) {
      console.log('Using client-provided admin status:', userInfo.isAdmin);
      profileData = profileData || { role: userInfo.isAdmin ? 'admin' : 'user', ai_plan_until: null };
    }

    console.log('Profile data:', {
      userId: user.id,
      profile: profileData,
      profileRole: profileData?.role,
      profileAIPlan: profileData?.ai_plan_until,
      profileError: profileError?.message,
    });

    // 프로필이 없으면 기본값으로 처리 (Free 플랜)
    const isAdmin = profileData?.role === 'admin';
    const hasAIPlan = profileData?.ai_plan_until 
      ? new Date(profileData.ai_plan_until) > new Date()
      : false;

    console.log('AI Plan check:', {
      userId: user.id,
      userEmail: user.email,
      profileRole: profileData?.role,
      isAdmin,
      ai_plan_until: profileData?.ai_plan_until,
      hasAIPlan,
      currentDate: new Date().toISOString(),
    });

    // 어드민이 아니고 AI 플랜이 없으면 에러
    if (!isAdmin && !hasAIPlan) {
      console.error('AI Pro plan check failed:', {
        userId: user.id,
        userEmail: user.email,
        profileRole: profileData?.role,
        isAdmin,
        hasAIPlan,
        ai_plan_until: profileData?.ai_plan_until,
      });
      return NextResponse.json(
        { 
          error: 'AI Pro plan required',
          details: {
            userId: user.id,
            userEmail: user.email,
            profileRole: profileData?.role,
            isAdmin,
            hasAIPlan,
            ai_plan_until: profileData?.ai_plan_until,
          }
        },
        { status: 402 }
      );
    }

    // 3. 해당 주의 모든 회고 조회
    // 날짜 형식 정규화 (YYYY-MM-DD)
    let weekStartStr: string;
    if (typeof weekStart === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
        // 이미 YYYY-MM-DD 형식이면 그대로 사용
        weekStartStr = weekStart;
      } else {
        // 다른 형식이면 Date 객체로 변환 (로컬 타임존 기준)
        const dateObj = new Date(weekStart + 'T00:00:00');
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        weekStartStr = `${year}-${month}-${day}`;
      }
    } else {
      const dateObj = new Date(weekStart);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      weekStartStr = `${year}-${month}-${day}`;
    }
    
    // 주 종료일 계산 (주 시작일 + 6일)
    const weekStartDate = new Date(weekStartStr + 'T00:00:00');
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    
    const year = weekEndDate.getFullYear();
    const month = String(weekEndDate.getMonth() + 1).padStart(2, '0');
    const day = String(weekEndDate.getDate()).padStart(2, '0');
    const weekEndStr = `${year}-${month}-${day}`;
    
    console.log('Fetching journals for week:', {
      originalWeekStart: weekStart,
      normalizedWeekStart: weekStartStr,
      weekEnd: weekEndStr,
      userId: user.id,
    });
    
    // 디버깅: 모든 회고 조회 (날짜 무관)
    const { data: allUserJournals } = await supabase
      .from('journals')
      .select('id, date, title, type')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(20);
    
    console.log('All user journals (for debugging):', {
      count: allUserJournals?.length || 0,
      journals: allUserJournals?.map(j => ({ 
        id: j.id, 
        date: j.date, 
        dateString: String(j.date),
        title: j.title 
      })) || [],
      searchWeekStart: weekStartStr,
      searchWeekEnd: weekEndStr,
    });
    
    // 클라이언트에서 전달한 회고 데이터가 있으면 우선 사용 (RLS 우회)
    let journals: any[] | null = null;
    let journalsError: any = null;
    
    console.log('Checking journals data for weekly:', {
      hasJournalsData: !!journalsData,
      isArray: Array.isArray(journalsData),
      length: journalsData?.length || 0,
      journalsDataType: typeof journalsData,
    });
    
    if (journalsData && Array.isArray(journalsData) && journalsData.length > 0) {
      console.log('✅ Using client-provided journals data (priority):', {
        count: journalsData.length,
        ids: journalsData.map((j: any) => j?.id),
        dates: journalsData.map((j: any) => ({ 
          id: j?.id, 
          date: j?.date, 
          dateString: String(j?.date),
          dateOnly: String(j?.date).split('T')[0],
        })),
      });
      journals = journalsData;
      journalsError = null;
      console.log('✅ Using client-provided journals:', journals.length);
    } else {
      console.log('No client-provided journals data, querying from DB...');
      // 클라이언트 데이터가 없으면 DB에서 조회
      const { data: journalsByDate, error: journalsByDateError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      journals = journalsByDate;
      journalsError = journalsByDateError;
      
      console.log('DB query result:', {
        count: journals?.length || 0,
        error: journalsError?.message || null,
      });
      
      // 정확한 일치가 없으면 모든 회고를 가져와서 필터링
      if ((!journals || journals.length === 0) && allUserJournals && allUserJournals.length > 0) {
        console.log('No exact match found, trying string comparison...');
        const matchingJournals = allUserJournals.filter(j => {
          const journalDate = String(j.date);
          return journalDate >= weekStartStr && journalDate <= weekEndStr;
        });
        
        if (matchingJournals.length > 0) {
          // 매칭된 ID로 전체 데이터 조회
          const matchingIds = matchingJournals.map(j => j.id);
          const { data: fullJournals, error: fullError } = await supabase
            .from('journals')
            .select('*')
            .eq('user_id', user.id)
            .in('id', matchingIds)
            .order('date', { ascending: true });
          
          if (!fullError && fullJournals) {
            journals = fullJournals;
            journalsError = null;
            console.log('Found journals by string comparison:', journals.length);
          }
        }
      }
    }

    if (journalsError) {
      console.error('Journals fetch error:', journalsError);
      return NextResponse.json(
        { error: 'Failed to fetch journals', details: journalsError.message },
        { status: 500 }
      );
    }

    console.log('Journals found:', {
      count: journals?.length || 0,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
    });

    // 회고가 없어도 분석 진행 (경고 메시지 포함)
    if (!journals || journals.length === 0) {
      return NextResponse.json(
        { 
          error: 'No journals found for this week',
          weekStart: weekStartStr,
          weekEnd: weekEndStr,
          warning: '이 주에 작성된 회고가 없습니다. 회고를 작성한 후 다시 시도해주세요.',
        },
        { status: 200 } // 404 대신 200으로 반환하여 클라이언트에서 처리
      );
    }

    // 4. AI 분석 실행
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // 주간 회고 내용 통합
    const weeklyContent = journals.map(j => ({
      date: j.date,
      type: j.type,
      content: formatJournalContent(j.content, j.type),
    })).join('\n\n---\n\n');

    const prompt = createWeeklyAnalysisPrompt(weekStart, weeklyContent, journals.length);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 회고 분석 전문가입니다. 주간 회고를 종합적으로 분석하여 패턴, 트렌드, 개선점을 찾아냅니다. 항상 한국어로 응답합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const analysisText = completion.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error('No response from OpenAI');
      }

      const analysisResult = JSON.parse(analysisText);
      
      const result = {
        summary: analysisResult.summary || '분석 결과를 생성할 수 없습니다.',
        keywords: analysisResult.keywords || [],
        patterns: analysisResult.patterns || [],
        improvements: analysisResult.improvements || [],
        weeklyTrend: analysisResult.weeklyTrend || '',
        nextWeekGoals: analysisResult.nextWeekGoals || [],
      };

      return NextResponse.json(result);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze weekly journals' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in weekly analyze route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatJournalContent(content: any, type: string): string {
  if (type === 'daily' || type === 'FREE') {
    return typeof content === 'string' ? content : JSON.stringify(content);
  }
  
  if (type === 'KPT') {
    const kpt = content as { keep?: string[]; problem?: string[]; try?: string[] };
    return `Keep: ${kpt.keep?.join(', ') || '없음'}\nProblem: ${kpt.problem?.join(', ') || '없음'}\nTry: ${kpt.try?.join(', ') || '없음'}`;
  }
  
  if (type === 'PMI') {
    const pmi = content as { plus?: string[]; minus?: string[]; interesting?: string[] };
    return `Plus: ${pmi.plus?.join(', ') || '없음'}\nMinus: ${pmi.minus?.join(', ') || '없음'}\nInteresting: ${pmi.interesting?.join(', ') || '없음'}`;
  }
  
  if (type === '4L') {
    const fourL = content as { liked?: string[]; learned?: string[]; lacked?: string[]; longedFor?: string[] };
    return `Liked: ${fourL.liked?.join(', ') || '없음'}\nLearned: ${fourL.learned?.join(', ') || '없음'}\nLacked: ${fourL.lacked?.join(', ') || '없음'}\nLonged for: ${fourL.longedFor?.join(', ') || '없음'}`;
  }
  
  return JSON.stringify(content);
}

function createWeeklyAnalysisPrompt(weekStart: string, weeklyContent: string, journalCount: number): string {
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  
  const weekStr = `${weekStartDate.toLocaleDateString('ko-KR')} ~ ${weekEndDate.toLocaleDateString('ko-KR')}`;
  
  return `다음은 ${weekStr} 주간에 작성된 ${journalCount}개의 회고입니다.

주간 회고 내용:
${weeklyContent}

이 주간 회고들을 종합적으로 분석하여 다음 JSON 형식으로 응답해주세요:
{
  "summary": "이번 주의 전체적인 흐름과 주요 변화를 요약한 내용 (3-4문장)",
  "keywords": ["주간 키워드1", "주간 키워드2", "주간 키워드3", "주간 키워드4", "주간 키워드5"],
  "patterns": ["반복되는 패턴 1", "반복되는 패턴 2", "반복되는 패턴 3"],
  "improvements": ["개선된 점 1", "개선된 점 2", "개선된 점 3"],
  "weeklyTrend": "이번 주의 전반적인 트렌드나 변화 방향을 설명하는 문장",
  "nextWeekGoals": ["다음 주 목표 1", "다음 주 목표 2", "다음 주 목표 3"]
}

요구사항:
- summary: 주간 전체의 흐름, 주요 성장 포인트, 변화를 포함한 종합 요약
- keywords: 주간 전체를 대표하는 키워드 5개
- patterns: 일주일 동안 반복되거나 지속된 패턴 3개
- improvements: 이번 주에 개선되거나 발전한 점 3개
- weeklyTrend: 주간 전반의 트렌드나 변화 방향을 한 문장으로 설명
- nextWeekGoals: 다음 주에 집중할 수 있는 구체적인 목표 3개
- 모든 내용은 한국어로 작성`;
}

