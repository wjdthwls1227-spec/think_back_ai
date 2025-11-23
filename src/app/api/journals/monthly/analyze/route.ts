import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, month, userInfo, journalsData } = body;
    
    console.log('Monthly analyze request received:', {
      hasYear: !!year,
      year,
      hasMonth: !!month,
      month,
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

    // 2. 프로필에서 AI 플랜 및 어드민 권한 확인
    if (userInfo && userInfo.id !== user.id) {
      console.error('User ID mismatch:', { clientUserId: userInfo.id, serverUserId: user.id });
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    const targetUserId = user.id;
    console.log('Fetching profile for user:', targetUserId);
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_plan_until, role')
      .eq('id', targetUserId)
      .maybeSingle();
    
    let profileData = profile;
    
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

    // 3. 해당 월의 모든 회고 조회
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const monthEnd = new Date(year, month, 0).toISOString().split('T')[0];
    
    // 클라이언트에서 전달한 회고 데이터가 있으면 우선 사용 (RLS 우회)
    let journals: any[] | null = null;
    let journalsError: any = null;
    
    console.log('Checking journals data for monthly:', {
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
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: true });
      
      journals = journalsByDate;
      journalsError = journalsByDateError;
      
      console.log('DB query result:', {
        count: journals?.length || 0,
        error: journalsError?.message || null,
      });
    }

    if (journalsError) {
      console.error('Journals fetch error:', journalsError);
      return NextResponse.json(
        { error: 'Failed to fetch journals', details: journalsError.message },
        { status: 500 }
      );
    }

    // 회고가 없어도 분석 진행 (경고 메시지 포함)
    if (!journals || journals.length === 0) {
      return NextResponse.json(
        { 
          error: 'No journals found for this month',
          warning: '이 달에 작성된 회고가 없습니다. 회고를 작성한 후 다시 시도해주세요.',
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

    // 월간 회고 내용 통합 (주별로 그룹핑)
    const weeklyGroups: { [key: string]: any[] } = {};
    journals.forEach(j => {
      const weekStart = getWeekStart(j.date);
      if (!weeklyGroups[weekStart]) {
        weeklyGroups[weekStart] = [];
      }
      weeklyGroups[weekStart].push(j);
    });

    const monthlyContent = Object.entries(weeklyGroups).map(([weekStart, weekJournals]) => {
      const weekContent = weekJournals.map(j => 
        `${j.date}: ${formatJournalContent(j.content, j.type)}`
      ).join('\n');
      return `주간 ${weekStart}:\n${weekContent}`;
    }).join('\n\n---\n\n');

    const prompt = createMonthlyAnalysisPrompt(year, month, monthlyContent, journals.length);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 회고 분석 전문가입니다. 월간 회고를 종합적으로 분석하여 장기적인 패턴, 성장 트렌드, 주요 변화를 찾아냅니다. 항상 한국어로 응답합니다.',
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
        longTermPatterns: analysisResult.longTermPatterns || [],
        growthAreas: analysisResult.growthAreas || [],
        monthlyTrend: analysisResult.monthlyTrend || '',
        achievements: analysisResult.achievements || [],
        nextMonthFocus: analysisResult.nextMonthFocus || [],
      };

      return NextResponse.json(result);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to analyze monthly journals' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in monthly analyze route:', error);
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

function getWeekStart(date: string): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const weekStart = new Date(d.setDate(diff));
  return weekStart.toISOString().split('T')[0];
}

function createMonthlyAnalysisPrompt(year: number, month: number, monthlyContent: string, journalCount: number): string {
  return `다음은 ${year}년 ${month}월에 작성된 ${journalCount}개의 회고입니다.

월간 회고 내용 (주별로 그룹핑):
${monthlyContent}

이 월간 회고들을 종합적으로 분석하여 다음 JSON 형식으로 응답해주세요:
{
  "summary": "이번 달의 전체적인 흐름, 주요 변화, 성장 포인트를 요약한 내용 (4-5문장)",
  "keywords": ["월간 키워드1", "월간 키워드2", "월간 키워드3", "월간 키워드4", "월간 키워드5"],
  "longTermPatterns": ["장기적인 패턴 1", "장기적인 패턴 2", "장기적인 패턴 3"],
  "growthAreas": ["성장 영역 1", "성장 영역 2", "성장 영역 3"],
  "monthlyTrend": "이번 달의 전반적인 트렌드나 변화 방향을 설명하는 문장",
  "achievements": ["이번 달의 주요 성과 1", "이번 달의 주요 성과 2", "이번 달의 주요 성과 3"],
  "nextMonthFocus": ["다음 달 집중 영역 1", "다음 달 집중 영역 2", "다음 달 집중 영역 3"]
}

요구사항:
- summary: 월간 전체의 흐름, 주요 성장 포인트, 변화, 트렌드를 포함한 종합 요약
- keywords: 월간 전체를 대표하는 키워드 5개
- longTermPatterns: 한 달 동안 지속되거나 반복된 장기적인 패턴 3개
- growthAreas: 이번 달에 성장한 영역이나 역량 3개
- monthlyTrend: 월간 전반의 트렌드나 변화 방향을 한 문장으로 설명
- achievements: 이번 달에 달성한 주요 성과나 목표 3개
- nextMonthFocus: 다음 달에 집중하거나 개선할 영역 3개
- 모든 내용은 한국어로 작성`;
}

