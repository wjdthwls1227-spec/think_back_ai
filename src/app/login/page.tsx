'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/auth/LoginButton';
import { EmailLoginForm } from '@/components/auth/EmailLoginForm';
import { useAuth } from '@/context/AuthContext';
import { FileText, History, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'choice' | 'email' | 'kakao'>('choice');

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            회고리즘
          </h1>
          <p className="text-gray-600">
            실행력 향상을 위한 AI 기반 회고 분석 플랫폼
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {loginMethod === 'choice' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">로그인 방법 선택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => setLoginMethod('email')}
                className="w-full p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <h3 className="font-medium">이메일로 로그인</h3>
                    <p className="text-sm text-gray-600">이메일과 비밀번호로 로그인</p>
                  </div>
                </div>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">또는</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  카카오 계정으로 간편하게 시작하세요
                </p>
                <LoginButton className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {loginMethod === 'email' && (
          <div className="space-y-4">
            <button
              onClick={() => setLoginMethod('choice')}
              className="text-blue-600 hover:text-blue-800 text-sm mb-4"
            >
              ← 로그인 방법 선택으로 돌아가기
            </button>
            <EmailLoginForm />
          </div>
        )}

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">주요 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">일일 회고 작성</h3>
                    <p className="text-sm text-gray-600">KPT, PMI 템플릿으로 체계적인 회고</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <History className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium">회고 히스토리</h3>
                    <p className="text-sm text-gray-600">과거 회고 검색 및 성장 추적</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">AI 분석 리포트</h3>
                    <p className="text-sm text-gray-600">주간 성과 분석 및 개선 추천</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}