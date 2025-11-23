'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Sparkles, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PricingPage() {
  const { user } = useAuth();

  const handleSelectPlan = (plan: 'free' | 'pro') => {
    if (!user) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    if (plan === 'pro') {
      // AI Pro 구매 페이지로 이동
      window.location.href = '/checkout/ai-pro';
    } else {
      // Free 플랜은 이미 사용 가능
      window.location.href = '/app/journal';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 상단 소개 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          요금제
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          당신의 성장을 위한 플랜을 선택하세요.<br />
          Free 플랜으로 시작하고, 필요할 때 AI Pro로 업그레이드하세요.
        </p>
      </div>

      {/* 요금제 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free 플랜 */}
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Free
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₩0</span>
              <span className="text-gray-600 dark:text-gray-400">/월</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">회고 작성 (무제한)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">회고 히스토리 조회</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">콘텐츠 개별 구매 가능</span>
              </li>
              <li className="flex items-start">
                <X className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 line-through">AI 회고 분석</span>
              </li>
              <li className="flex items-start">
                <X className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 line-through">월간 리포트</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelectPlan('free')}
            >
              {user ? '현재 플랜' : '로그인 후 시작하기'}
            </Button>
          </CardContent>
        </Card>

        {/* AI Pro 플랜 */}
        <Card className="border-2 border-blue-500 dark:border-blue-400 relative">
          <div className="absolute top-0 right-0 bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
            추천
          </div>
          <CardHeader>
            <div className="flex items-center mb-2">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Pro
              </CardTitle>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">₩9,900</span>
              <span className="text-gray-600 dark:text-gray-400">/월</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">Free 플랜의 모든 기능</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">AI 회고 분석 (무제한)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">월간 리포트 (계획)</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">패턴 분석 및 인사이트</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">우선 고객 지원</span>
              </li>
            </ul>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => handleSelectPlan('pro')}
            >
              {user ? '플랜 적용하기' : '로그인 후 시작하기'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ 또는 추가 정보 */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          자주 묻는 질문
        </h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                Free 플랜에서도 모든 기능을 사용할 수 있나요?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Free 플랜에서는 회고 작성과 히스토리 조회가 가능하며, 콘텐츠도 개별 구매할 수 있습니다.
                AI 분석 기능은 AI Pro 플랜에서만 이용 가능합니다.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                AI Pro 플랜은 언제 출시되나요?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                AI Pro 플랜은 곧 출시 예정입니다. 출시 알림을 받으시려면 로그인 후 대시보드를 확인해주세요.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                플랜을 변경할 수 있나요?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                언제든지 플랜을 변경할 수 있습니다. Free에서 AI Pro로 업그레이드하거나, AI Pro에서 Free로 다운그레이드할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

