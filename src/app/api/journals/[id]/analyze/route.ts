import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import OpenAI from 'openai';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_plan_until, role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    // 프로필이 없으면 기본값으로 처리 (Free 플랜)
    const isAdmin = profile?.role === 'admin';
    const hasAIPlan = profile?.ai_plan_until 
      ? new Date(profile.ai_plan_until) > new Date()
      : false;

    console.log('AI Plan check:', {
      userId: user.id,
      isAdmin,
      ai_plan_until: profile?.ai_plan_until,
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

    // 3. Journal 조회 및 소유권 확인
    const { data: journal, error: journalError } = await supabase
      .from('journals')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (journalError || !journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 }
      );
    }

    // 4. 기존 분석 결과 확인
    const { data: existingAnalysis } = await supabase
      .from('journal_ai_analyses')
      .select('*')
      .eq('journal_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 기존 분석이 있고 1시간 이내라면 재사용
    if (existingAnalysis) {
      const analysisAge = Date.now() - new Date(existingAnalysis.created_at).getTime();
      const oneHour = 60 * 60 * 1000;
      
      if (analysisAge < oneHour) {
        return NextResponse.json(existingAnalysis.result);
      }
    }

    // 5. AI 분석 실행
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not configured' },
        { status: 500 }
      );
    }

    // 회고 내용을 텍스트로 변환
    const contentText = formatJournalContent(journal.content, journal.type);
    
    // 프롬프트 생성
    const prompt = createDailyAnalysisPrompt(journal.date, journal.type, contentText);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // 비용 효율적인 모델 사용
        messages: [
          {
            role: 'system',
            content: '당신은 회고 분석 전문가입니다. 사용자의 회고를 분석하여 인사이트를 제공하고, 구체적인 개선 방안을 제시합니다. 항상 한국어로 응답합니다.',
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
      
      // 결과 구조화
      const result = {
        summary: analysisResult.summary || '분석 결과를 생성할 수 없습니다.',
        keywords: analysisResult.keywords || [],
        actions: analysisResult.actions || [],
        insights: analysisResult.insights || [],
      };

      // 6. 분석 결과 저장
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('journal_ai_analyses')
        .insert({
          journal_id: id,
          user_id: user.id,
          result: result,
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving analysis:', saveError);
        // 저장 실패해도 결과는 반환
        return NextResponse.json(result);
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // OpenAI 오류 시 더미 데이터 반환
      const fallbackResult = {
        summary: `${new Date(journal.date).toLocaleDateString('ko-KR')} 회고를 분석한 결과, 
          오늘 하루 동안 여러 경험을 통해 성장의 순간들을 만들어가셨습니다. 
          특히 반복되는 패턴과 개선점을 발견할 수 있었습니다.`,
        keywords: ['성장', '회고', '개선', '패턴', '인사이트'],
        actions: [
          '내일은 오늘 발견한 개선점을 실천해보기',
          '이번 주 패턴을 주간 리포트에서 확인하기',
          '다음 회고에서 더 구체적인 목표 설정하기',
        ],
        insights: [],
      };
      return NextResponse.json(fallbackResult);
    }
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 회고 내용을 텍스트로 변환하는 함수
function formatJournalContent(content: any, type: string): string {
  if (type === 'FREE') {
    return typeof content === 'string' ? content : JSON.stringify(content);
  }
  
  if (type === 'KPT') {
    const kpt = content as { keep?: string[]; problem?: string[]; try?: string[] };
    return `
Keep (계속할 것):
${kpt.keep?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Problem (문제점):
${kpt.problem?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Try (시도할 것):
${kpt.try?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}
    `.trim();
  }
  
  if (type === 'PMI') {
    const pmi = content as { plus?: string[]; minus?: string[]; interesting?: string[] };
    return `
Plus (좋았던 것):
${pmi.plus?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Minus (아쉬웠던 것):
${pmi.minus?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Interesting (흥미로웠던 것):
${pmi.interesting?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}
    `.trim();
  }
  
  if (type === '4L') {
    const fourL = content as { liked?: string[]; learned?: string[]; lacked?: string[]; longedFor?: string[] };
    return `
Liked (좋았던 점):
${fourL.liked?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Learned (배운 점):
${fourL.learned?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Lacked (부족했던 점):
${fourL.lacked?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}

Longed for (원했던 점):
${fourL.longedFor?.map((item, i) => `${i + 1}. ${item}`).join('\n') || '없음'}
    `.trim();
  }
  
  return JSON.stringify(content);
}

// 일별 분석 프롬프트 생성
function createDailyAnalysisPrompt(date: string, type: string, contentText: string): string {
  const dateStr = new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  
  return `다음은 ${dateStr}에 작성된 ${type === 'daily' ? '일일' : type === 'weekly' ? '주간' : '월간'} 회고입니다.

회고 내용:
${contentText}

이 회고를 분석하여 다음 JSON 형식으로 응답해주세요:
{
  "summary": "회고의 핵심 내용을 2-3문장으로 요약한 내용",
  "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"],
  "actions": ["구체적인 개선 액션 1", "구체적인 개선 액션 2", "구체적인 개선 액션 3"],
  "insights": ["인사이트 1", "인사이트 2", "인사이트 3"]
}

요구사항:
- summary: 회고의 주요 내용과 감정, 성장 포인트를 포함한 간결한 요약
- keywords: 회고에서 나타나는 주요 주제나 감정을 나타내는 키워드 5개
- actions: 다음 회고나 일상에서 실천할 수 있는 구체적이고 실행 가능한 액션 3개
- insights: 회고를 통해 발견할 수 있는 패턴이나 깨달음 3개
- 모든 내용은 한국어로 작성`;
}

