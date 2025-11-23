'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

type Step = 'email' | 'sent';

export function EmailLoginForm() {
  const { signInWithMagicLink } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithMagicLink(email);
      setStep('sent');
    } catch (err) {
      console.error('Email send error:', err);
      setError('인증 이메일 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setError('');
    setResendLoading(true);

    try {
      await signInWithMagicLink(email);
    } catch (err) {
      console.error('Email resend error:', err);
      setError('인증 이메일 재전송에 실패했습니다.');
    } finally {
      setResendLoading(false);
    }
  };

  const goBackToEmail = () => {
    setStep('email');
    setError('');
  };

  if (step === 'email') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">이메일 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                이메일 주소를 입력하시면 로그인 링크를 보내드립니다
              </p>
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className="pl-10"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? '전송 중...' : '로그인 링크 받기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">이메일 확인</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">이메일을 확인해주세요</h3>
            <p className="text-sm text-gray-600">
              <span className="font-medium">{email}</span>로<br />
              로그인 링크를 전송했습니다
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">다음 단계:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. 이메일 앱을 확인해주세요</li>
              <li>2. &quot;로그인&quot; 또는 &quot;확인&quot; 버튼을 클릭하세요</li>
              <li>3. 자동으로 로그인됩니다</li>
            </ol>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {resendLoading ? '재전송 중...' : '이메일 재전송'}
            </button>
            
            <div>
              <button
                type="button"
                onClick={goBackToEmail}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>다른 이메일 주소 사용</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}