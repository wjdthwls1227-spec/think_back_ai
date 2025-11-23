'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginButton } from '@/components/auth/LoginButton';
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm';
import { useAuth } from '@/context/AuthContext';
import { FileText, History, BarChart3 } from 'lucide-react';

const emailLoginAvailable = true;

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loginMethod] = useState<'kakao'>('kakao');

  useEffect(() => {
    if (!loading && user) {
      // redirect 쿼리 파라미터 확인
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect');
        router.push(redirect || '/app/dashboard');
      } else {
        router.push('/app/dashboard');
      }
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
            회고리즘 (Think Back AI)
          </h1>
          <p className="text-gray-600">
            AI 기반 회고 분석 플랫폼
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        {/* 이메일 로그인 */}
        {emailLoginAvailable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg">이메일 로그인</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailPasswordForm />
            </CardContent>
          </Card>
        )}

        {/* 카카오 로그인 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {emailLoginAvailable ? '또는' : '카카오 로그인으로 이용해 주세요'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <LoginButton className="w-full" />
          </CardContent>
        </Card>

        <div className="pt-2">
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