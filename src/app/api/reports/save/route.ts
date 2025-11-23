import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, periodStart, periodEnd, analysisResult, journalIds } = body;
    
    console.log('Save report request received:', {
      reportType,
      periodStart,
      periodEnd,
      hasAnalysisResult: !!analysisResult,
      journalIdsCount: journalIds?.length || 0,
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
    
    // 사용자 인증 확인
    let user;
    let authError;
    
    if (token) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      user = tokenUser;
      authError = tokenError;
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
    
    // 리포트 분석 결과 저장
    // RLS 정책이 작동하도록 하기 위해, 토큰이 있으면 Authorization 헤더를 포함한 요청 사용
    console.log('Attempting to save report:', {
      userId: user.id,
      reportType,
      periodStart,
      periodEnd: periodEnd || periodStart,
      journalIdsCount: journalIds?.length || 0,
    });

    // RLS 정책이 작동하도록 토큰을 사용하여 새 클라이언트 생성
    // 서비스 롤 키가 있으면 사용 (RLS 우회), 없으면 토큰 기반 클라이언트 사용
    let insertClient = supabase;
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // 서비스 롤 키를 사용하여 RLS 우회 (서버 측에서만 사용)
      const { createClient: createServiceClient } = await import('@supabase/supabase-js');
      insertClient = createServiceClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
      console.log('Using service role key for insert (RLS bypass)');
    } else if (token) {
      // 토큰이 있으면 토큰 기반 클라이언트 생성
      const { createClient: createTokenClient } = await import('@supabase/supabase-js');
      insertClient = createTokenClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      console.log('Using token-based client for insert');
    }

    const { data: savedReport, error: saveError } = await insertClient
      .from('report_analyses')
      .insert({
        user_id: user.id,
        report_type: reportType,
        period_start: periodStart,
        period_end: periodEnd || periodStart,
        analysis_result: analysisResult,
        journal_ids: journalIds || [],
      })
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving report:', {
        error: saveError,
        code: saveError.code,
        message: saveError.message,
        details: saveError.details,
        hint: saveError.hint,
        userId: user.id,
        reportType,
        periodStart,
      });
      return NextResponse.json(
        { 
          error: 'Failed to save report', 
          details: saveError.message,
          code: saveError.code,
          hint: saveError.hint,
          supabaseError: saveError,
        },
        { status: 500 }
      );
    }
    
    console.log('Report saved successfully:', {
      reportId: savedReport?.id,
      userId: user.id,
      reportType,
    });
    
    return NextResponse.json({
      success: true,
      report: savedReport,
    });
  } catch (error) {
    console.error('Error in save report route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

