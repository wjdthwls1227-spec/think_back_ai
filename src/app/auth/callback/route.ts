import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // OAuth 코드 기반 인증 (카카오 등)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('OAuth code exchange error:', error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Magic Link의 경우 토큰이 URL 해시에 있으므로 홈으로 리다이렉트
  // AuthContext에서 자동으로 세션을 감지하여 처리함
  return NextResponse.redirect(`${origin}/`);
}