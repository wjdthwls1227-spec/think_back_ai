'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResendEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 이메일 인증 링크 재전송
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendError) {
        console.error('Resend error:', resendError);
        
        if (resendError.message?.includes('rate limit')) {
          setError('너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.');
        } else if (resendError.message?.includes('not found') || resendError.message?.includes('does not exist')) {
          setError('해당 이메일로 가입된 계정이 없습니다.');
        } else {
          setError(`이메일 재전송 실패: ${resendError.message}`);
        }
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      console.error('Unexpected error:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`오류: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            인증 메일 재전송
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            인증 메일을 받지 못하셨나요?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">인증 메일 재전송</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>{email}</strong>로 인증 메일을 다시 보냈습니다.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  이메일을 확인하고 인증 링크를 클릭해주세요.
                </p>
                <div className="pt-4 space-y-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      로그인 페이지로 이동
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                  >
                    다른 이메일로 재전송
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    이메일 주소
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="email"
                      placeholder="가입하신 이메일 주소"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? '전송 중...' : '인증 메일 재전송'}
                </Button>

                <div className="text-center text-sm space-y-2">
                  <Link href="/login" className="block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    로그인 페이지로 돌아가기
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    메일이 오지 않으면 스팸 폴더를 확인해주세요.
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* 도움말 */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p className="font-semibold">인증 메일이 오지 않는 경우:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>스팸 폴더를 확인해주세요</li>
                <li>이메일 주소가 정확한지 확인해주세요</li>
                <li>몇 분 후에도 오지 않으면 재전송을 시도해주세요</li>
                <li>Supabase 대시보드에서 이메일 설정을 확인해주세요</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

