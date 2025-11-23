import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { question, context, period, userInfo } = await request.json();
    
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
      return NextResponse.json(
        { 
          error: 'AI Pro plan required',
          details: {
            isAdmin,
            hasAIPlan,
            ai_plan_until: profile?.ai_plan_until,
          }
        },
        { status: 402 }
      );
    }

    if (!question || !context) {
      return NextResponse.json(
        { error: 'Question and context are required' },
        { status: 400 }
      );
    }

    // 3. AI 질문 처리
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // 컨텍스트를 텍스트로 변환
    const contextText = formatAnalysisContext(context, period);

    const prompt = `다음은 사용자의 ${period === 'weekly' ? '주간' : '월간'} 회고 분석 결과입니다:

${contextText}

사용자 질문: ${question}

위 분석 결과를 바탕으로 사용자의 질문에 대해 친절하고 구체적으로 답변해주세요. 분석 결과에 없는 내용은 추측하지 말고, 분석 결과에 기반한 답변만 제공해주세요. 한국어로 답변해주세요.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 회고 분석 전문가입니다. 사용자의 회고 분석 결과를 바탕으로 질문에 답변합니다. 항상 한국어로 응답하고, 분석 결과에 기반한 구체적이고 도움이 되는 답변을 제공합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const answer = completion.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';

      return NextResponse.json({ answer });
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to process question' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatAnalysisContext(context: any, period: 'weekly' | 'monthly'): string {
  let text = '';
  
  if (period === 'weekly') {
    text += `주간 분석 요약:\n${context.summary || ''}\n\n`;
    
    if (context.keywords && context.keywords.length > 0) {
      text += `주요 키워드: ${context.keywords.join(', ')}\n\n`;
    }
    
    if (context.patterns && context.patterns.length > 0) {
      text += `패턴:\n${context.patterns.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\n`;
    }
    
    if (context.improvements && context.improvements.length > 0) {
      text += `개선점:\n${context.improvements.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\n`;
    }
    
    if (context.weeklyTrend) {
      text += `주간 트렌드: ${context.weeklyTrend}\n\n`;
    }
    
    if (context.nextWeekGoals && context.nextWeekGoals.length > 0) {
      text += `다음 주 목표:\n${context.nextWeekGoals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}\n`;
    }
  } else {
    text += `월간 분석 요약:\n${context.summary || ''}\n\n`;
    
    if (context.keywords && context.keywords.length > 0) {
      text += `주요 키워드: ${context.keywords.join(', ')}\n\n`;
    }
    
    if (context.longTermPatterns && context.longTermPatterns.length > 0) {
      text += `장기 패턴:\n${context.longTermPatterns.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\n`;
    }
    
    if (context.growthAreas && context.growthAreas.length > 0) {
      text += `성장 영역:\n${context.growthAreas.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}\n\n`;
    }
    
    if (context.monthlyTrend) {
      text += `월간 트렌드: ${context.monthlyTrend}\n\n`;
    }
    
    if (context.achievements && context.achievements.length > 0) {
      text += `주요 성과:\n${context.achievements.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}\n\n`;
    }
    
    if (context.nextMonthFocus && context.nextMonthFocus.length > 0) {
      text += `다음 달 집중 영역:\n${context.nextMonthFocus.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}\n`;
    }
  }
  
  return text;
}

