import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId } = body;
    
    console.log('Delete report request received:', {
      reportId,
    });
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // Authorization 헤더에서 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    // 쿠키에서 Supabase 클라이언트 생성
    const cookieStore = await cookies();
    let supabase;

    // 서비스 롤 키가 있으면 사용 (RLS 우회)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Using service role key for report delete.');
      const { createClient } = await import('@supabase/supabase-js');
      supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    } else {
      // 없으면 일반 클라이언트 사용
      supabase = createServerClient<Database>(
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
    }
    
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
    
    // 먼저 리포트가 존재하고 사용자가 소유자인지 확인
    const { data: report, error: fetchError } = await supabase
      .from('report_analyses')
      .select('id, user_id')
      .eq('id', reportId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching report:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch report', details: fetchError.message },
        { status: 500 }
      );
    }
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // 사용자가 소유자인지 확인
    if (report.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own reports' },
        { status: 403 }
      );
    }
    
    // 리포트 삭제
    const { error: deleteError } = await supabase
      .from('report_analyses')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.error('Error deleting report:', {
        error: deleteError,
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        reportId,
        userId: user.id,
      });
      return NextResponse.json(
        { 
          error: 'Failed to delete report', 
          details: deleteError.message,
          code: deleteError.code,
          hint: deleteError.hint,
        },
        { status: 500 }
      );
    }
    
    console.log('Report deleted successfully:', {
      reportId,
      userId: user.id,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete report route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

