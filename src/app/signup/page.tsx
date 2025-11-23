'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

const SIGNUP_PATHS = [
  '검색엔진(구글, 네이버 등)',
  'SNS(인스타그램, 페이스북 등)',
  '지인 추천',
  '블로그/커뮤니티',
  '기타',
] as const;

export default function SignupPage() {
  const { user, signUp } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [signupPath, setSignupPath] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/app/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 유효성 검사
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!displayName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!signupPath) {
      setError('가입경로를 선택해주세요.');
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Starting signup process...');
      await signUp(email, password, displayName, signupPath);
      console.log('✅ Signup successful');
      setSuccess(true);
    } catch (err: unknown) {
      console.error('❌ Signup error:', err);
      
      // Supabase 에러 객체 처리
      if (err && typeof err === 'object' && 'message' in err) {
        const supabaseError = err as { message: string; code?: string; details?: string; hint?: string };
        console.error('Error details:', {
          message: supabaseError.message,
          code: supabaseError.code,
          details: supabaseError.details,
          hint: supabaseError.hint,
        });
        
        const errorMessage = supabaseError.message;
        
        if (errorMessage.includes('User already registered') || errorMessage.includes('already registered')) {
          setError('이미 가입된 이메일입니다. 로그인해주세요.');
        } else if (errorMessage.includes('Invalid email') || errorMessage.includes('invalid email')) {
          setError('유효한 이메일 주소를 입력해주세요.');
        } else if (errorMessage.includes('Password')) {
          setError('비밀번호 요구사항을 확인해주세요.');
        } else {
          setError(`회원가입에 실패했습니다: ${errorMessage}`);
        }
      } else {
        const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(`회원가입에 실패했습니다: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg text-green-600">
                회원가입 완료
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl mb-4">📧</div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>{email}</strong>로 인증 메일을 보냈습니다.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이메일을 확인하고 인증 링크를 클릭해주세요.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                인증이 완료되면 로그인할 수 있습니다.
              </p>
              <div className="pt-4 space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    로그인 페이지로 이동
                  </Button>
                </Link>
                <Link href="/auth/resend-email">
                  <Button variant="ghost" className="w-full">
                    인증 메일 재전송
                  </Button>
                </Link>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            회원가입
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            회고리즘에 오신 것을 환영합니다
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">회원가입</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이름 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이메일 *
                </label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 * (최소 6자)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  비밀번호 확인 *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  가입경로 *
                </label>
                <select
                  value={signupPath}
                  onChange={(e) => {
                    setSignupPath(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">가입경로를 선택하세요</option>
                  {SIGNUP_PATHS.map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
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
                {loading ? '가입 중...' : '회원가입'}
              </Button>

              <div className="text-center text-sm">
                <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  이미 계정이 있으신가요? 로그인
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

