import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, userInfo, journalIds, journalsData } = body;
    
    console.log('Daily analyze request received:', {
      hasDate: !!date,
      date,
      hasUserInfo: !!userInfo,
      hasJournalIds: !!journalIds,
      journalIdsCount: journalIds?.length || 0,
      hasJournalsData: !!journalsData,
      journalsDataCount: journalsData?.length || 0,
      journalsDataIds: journalsData?.map((j: any) => j?.id) || [],
    });
    
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // 쿠키에서 Supabase 클라이언트 생성
    const cookieStore = await cookies();
    let supabase = createServerClient<Database>(
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
      // 토큰이 있으면 토큰을 사용하는 새로운 클라이언트 생성 (RLS를 위해)
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
      
      // 토큰이 있으면 세션 설정 시도 (RLS를 위해)
      if (user && !tokenError) {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: '',
          });
          if (sessionError) {
            console.warn('Session set error:', sessionError);
          } else {
            console.log('Session set successfully');
          }
        } catch (sessionError) {
          console.warn('Session set warning:', sessionError);
        }
      }
    } else {
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
      hasToken: !!token,
    });

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

    // 3. 해당 날짜의 모든 회고 조회
    // 날짜 형식 정규화 (YYYY-MM-DD) - 로컬 타임존 기준으로 처리
    let dateStr: string;
    if (typeof date === 'string') {
      // 이미 YYYY-MM-DD 형식이면 그대로 사용
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateStr = date;
      } else {
        // 다른 형식이면 Date 객체로 변환 (로컬 타임존 기준)
        const dateObj = new Date(date + 'T00:00:00');
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
    } else {
      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }
    
    console.log('Fetching journals for date:', {
      originalDate: date,
      normalizedDate: dateStr,
      userId: user.id,
    });
    
    // 먼저 해당 사용자의 모든 회고를 조회하여 날짜 형식 확인
    const { data: allUserJournals } = await supabase
      .from('journals')
      .select('id, date, title, type')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);
    
    console.log('All user journals (for debugging):', {
      count: allUserJournals?.length || 0,
      journals: allUserJournals || [],
      searchDate: dateStr,
      searchDateType: typeof dateStr,
    });
    
    // 날짜 비교를 위해 모든 회고의 날짜 확인
    if (allUserJournals && allUserJournals.length > 0) {
      const allDates = allUserJournals.map(j => ({ 
        date: j.date, 
        dateType: typeof j.date,
        dateString: String(j.date),
        matches: j.date === dateStr || String(j.date) === dateStr
      }));
      
      console.log('Date comparison:', {
        searchDate: dateStr,
        searchDateType: typeof dateStr,
        allDates: allDates,
        exactMatches: allDates.filter(d => d.matches),
      });
      
      // 정확한 일치가 없으면 문자열 비교로 재시도
      const matchingByString = allUserJournals.filter(j => String(j.date) === dateStr);
      if (matchingByString.length > 0) {
        console.log('Found matching journals by string comparison:', matchingByString);
      }
    }
    
    // 클라이언트에서 전달한 회고 데이터가 있으면 우선 사용 (RLS 우회)
    let journals: any[] | null = null;
    let journalsError: any = null;
    
    console.log('Checking journals data:', {
      hasJournalsData: !!journalsData,
      isArray: Array.isArray(journalsData),
      length: journalsData?.length || 0,
      journalsDataType: typeof journalsData,
      journalsDataPreview: journalsData ? (Array.isArray(journalsData) ? `Array(${journalsData.length})` : String(journalsData).substring(0, 100)) : 'null',
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
        .eq('date', dateStr)
        .order('created_at', { ascending: true });
      
      journals = journalsByDate;
      journalsError = journalsByDateError;
      
      console.log('DB query result:', {
        count: journals?.length || 0,
        error: journalsError?.message || null,
      });
    }
    
    // 클라이언트에서 전달한 회고 ID가 있으면 해당 ID로 조회 시도 (fallback)
    if ((!journals || journals.length === 0) && journalIds && Array.isArray(journalIds) && journalIds.length > 0) {
      console.log('No journals found by date, trying with client-provided IDs:', {
        journalIds,
        userId: user.id,
        dateStr,
      });
      
      // 먼저 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        accessToken: session?.access_token ? 'present' : 'missing',
      });
      
      const { data: journalsById, error: journalsByIdError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .in('id', journalIds)
        .order('created_at', { ascending: true });
      
      console.log('Journals by ID query result:', {
        count: journalsById?.length || 0,
        error: journalsByIdError ? {
          message: journalsByIdError.message,
          code: journalsByIdError.code,
          details: journalsByIdError.details,
          hint: journalsByIdError.hint,
        } : null,
        userId: user.id,
        journalIds,
        foundJournals: journalsById?.map(j => ({ id: j.id, date: j.date, title: j.title })) || [],
      });
      
      if (!journalsByIdError && journalsById && journalsById.length > 0) {
        journals = journalsById;
        journalsError = null;
        console.log('✅ Found journals by client-provided IDs:', journals.length);
      } else if (journalsByIdError) {
        console.error('❌ Error fetching journals by ID:', {
          error: journalsByIdError,
          message: journalsByIdError.message,
          code: journalsByIdError.code,
          details: journalsByIdError.details,
          hint: journalsByIdError.hint,
        });
        // RLS 에러일 수 있으므로 에러를 기록하지만 계속 진행
      } else {
        console.warn('⚠️ No journals found by ID, but no error:', {
          journalIds,
          userId: user.id,
        });
      }
    }
    
    // 정확한 일치가 없으면 모든 회고를 가져와서 필터링
    if ((!journals || journals.length === 0) && allUserJournals && allUserJournals.length > 0) {
      console.log('No exact match found, trying string comparison...');
      const matchingJournals = allUserJournals.filter(j => String(j.date) === dateStr);
      if (matchingJournals.length > 0) {
        // 매칭된 ID로 전체 데이터 조회
        const matchingIds = matchingJournals.map(j => j.id);
        const { data: fullJournals, error: fullError } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .in('id', matchingIds)
          .order('created_at', { ascending: true });
        
        if (!fullError && fullJournals) {
          journals = fullJournals;
          journalsError = null;
          console.log('Found journals by string comparison:', journals.length);
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
    
    console.log('Journals found for date:', {
      count: journals?.length || 0,
      date: dateStr,
      userId: user.id,
      journals: journals?.map(j => ({ 
        id: j.id, 
        type: j.type, 
        date: j.date, 
        dateString: String(j.date),
        title: j.title,
        created_at: j.created_at 
      })) || [],
    });


    // 회고가 없어도 분석 진행 (경고 메시지 포함)
    if (!journals || journals.length === 0) {
      return NextResponse.json(
        { 
          error: 'No journals found for this date',
          date: dateStr,
          warning: '이 날짜에 작성된 회고가 없습니다. 회고를 작성한 후 다시 시도해주세요.',
        },
        { status: 200 }
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

    // 일간 회고 내용 통합
    let dailyContent: string;
    try {
      const formattedJournals = journals.map(j => {
        try {
          const formattedContent = formatJournalContent(j.content, j.type);
          return `${j.title || '제목 없음'} (${j.type}):\n${formattedContent}`;
        } catch (contentError) {
          console.error('Error formatting journal content:', contentError, j);
          return `${j.title || '제목 없음'} (${j.type}):\n${JSON.stringify(j.content)}`;
        }
      });
      dailyContent = formattedJournals.join('\n\n---\n\n');
    } catch (contentError) {
      console.error('Error creating daily content:', contentError);
      return NextResponse.json(
        { error: 'Failed to format journal content', details: contentError instanceof Error ? contentError.message : String(contentError) },
        { status: 500 }
      );
    }

    const prompt = createDailyAnalysisPrompt(dateStr, dailyContent, journals.length);

    console.log('Calling OpenAI API:', {
      journalCount: journals.length,
      promptLength: prompt.length,
      hasApiKey: !!process.env.OPENAI_API_KEY,
    });

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 회고 분석 전문가입니다. 일간 회고를 종합적으로 분석하여 하루의 주요 활동, 감정, 성장 포인트를 찾아냅니다. 항상 한국어로 응답합니다.',
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
        highlights: analysisResult.highlights || [],
        emotions: analysisResult.emotions || [],
        learnings: analysisResult.learnings || [],
        tomorrowFocus: analysisResult.tomorrowFocus || [],
        journalCount: journals.length,
      };

      return NextResponse.json(result);
    } catch (error) {
      console.error('OpenAI API error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return NextResponse.json(
        { 
          error: 'Failed to analyze daily journals',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in daily analyze route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
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

function createDailyAnalysisPrompt(date: string, dailyContent: string, journalCount: number): string {
  const dateObj = new Date(date);
  const dateStr = dateObj.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  return `다음은 ${dateStr}에 작성된 ${journalCount}개의 회고입니다.

일간 회고 내용:
${dailyContent}

이 일간 회고들을 종합적으로 분석하여 다음 JSON 형식으로 응답해주세요:
{
  "summary": "오늘 하루의 전체적인 흐름과 주요 활동을 요약한 내용 (3-4문장)",
  "keywords": ["오늘의 키워드1", "오늘의 키워드2", "오늘의 키워드3", "오늘의 키워드4", "오늘의 키워드5"],
  "highlights": ["오늘의 하이라이트 1", "오늘의 하이라이트 2", "오늘의 하이라이트 3"],
  "emotions": ["주요 감정 1", "주요 감정 2", "주요 감정 3"],
  "learnings": ["오늘 배운 점 1", "오늘 배운 점 2", "오늘 배운 점 3"],
  "tomorrowFocus": ["내일 집중할 점 1", "내일 집중할 점 2", "내일 집중할 점 3"]
}

요구사항:
- summary: 하루 전체의 흐름, 주요 활동, 성과를 포함한 종합 요약
- keywords: 오늘 하루를 대표하는 키워드 5개
- highlights: 오늘의 가장 중요한 순간이나 성과 3개
- emotions: 오늘 느낀 주요 감정 3개
- learnings: 오늘 배우거나 깨달은 점 3개
- tomorrowFocus: 내일 집중하거나 개선할 점 3개
- 모든 내용은 한국어로 작성`;

