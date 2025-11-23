import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('=== OAuth Callback Debug ===');
  console.log('Origin:', origin);
  console.log('Full URL:', request.url);
  console.log('Code:', code ? 'Present' : 'Missing');
  console.log('Error params:', errorParam, errorDescription);

  // 에러가 있으면 에러 페이지로 리디렉션
  if (errorParam) {
    console.error('❌ OAuth error received:', errorParam, errorDescription);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${errorParam}&description=${encodeURIComponent(errorDescription || '')}`);
  }

  // OAuth 코드 기반 인증 (카카오 등)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log('✅ Code exchange successful');
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('❌ OAuth code exchange error:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // 이메일 인증 링크 처리 (Supabase는 hash fragment를 사용하므로 여기서는 확인만)
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  if (token && type === 'signup') {
    // 이메일 인증 페이지로 리다이렉트
    return NextResponse.redirect(`${origin}/auth/verify-email?token=${token}&type=${type}`);
  }

  // Supabase의 이메일 인증은 hash fragment를 사용하므로
  // 클라이언트 사이드에서 처리하도록 인증 확인 페이지로 리다이렉트
  // (hash는 서버에서 접근 불가)
  return NextResponse.redirect(`${origin}/auth/verify-email`);
}