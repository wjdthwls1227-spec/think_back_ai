'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (typeof window === 'undefined') return;

      try {
        // 먼저 현재 세션 확인 (Supabase가 이미 세션을 생성했을 수 있음)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && session.user && session.user.email_confirmed_at) {
          // 세션이 있고 이메일이 인증되었으면 성공
          setEmail(session.user.email || '');
          setStatus('success');
          
          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
          return;
        }

        // URL에서 토큰 확인 (query parameter 또는 hash fragment)
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        // Hash fragment 확인 (Supabase 이메일 인증은 hash를 사용)
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const hashToken = hashParams.get('access_token');
        const hashType = hashParams.get('type');

        // Query parameter 또는 hash에서 토큰 찾기
        const finalToken = token || hashToken;
        const finalType = type || hashType;

        if (finalToken && finalType === 'signup') {
          // 토큰으로 인증 시도
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: finalToken,
            type: 'signup',
          });

          if (error) {
            console.error('Email verification error:', error);
            if (error.message?.includes('expired') || error.message?.includes('invalid')) {
              setStatus('expired');
            } else {
              setStatus('error');
            }
            return;
          }

          if (data.user) {
            setEmail(data.user.email || '');
            setStatus('success');
            
            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/login?verified=true');
            }, 3000);
          }
        } else {
          // 토큰이 없으면 세션 재확인 (이미 인증되었을 수 있음)
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (newSession && newSession.user && newSession.user.email_confirmed_at) {
            setEmail(newSession.user.email || '');
            setStatus('success');
            setTimeout(() => {
              router.push('/login?verified=true');
            }, 3000);
          } else {
            setStatus('error');
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                이메일 인증 중...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                잠시만 기다려주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                이메일 인증 완료!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {email && (
                  <>
                    <span className="font-medium">{email}</span> 이메일 인증이 완료되었습니다.
                  </>
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                이제 로그인하실 수 있습니다.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  로그인하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                인증 링크가 만료되었습니다
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                인증 링크의 유효기간이 지났습니다. 새로운 인증 이메일을 요청해주세요.
              </p>
              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full">
                    로그인 페이지로 이동
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  로그인 페이지에서 이메일 재전송을 요청할 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              인증 실패
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              이메일 인증에 실패했습니다. 다시 시도해주세요.
            </p>
            <Link href="/login">
              <Button className="w-full">
                로그인 페이지로 이동
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

