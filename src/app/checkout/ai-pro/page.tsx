'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AICheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [hasAIPlan, setHasAIPlan] = useState(false);
  const [planUntil, setPlanUntil] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout/ai-pro');
      return;
    }

    if (user) {
      checkAIPlan();
    }
  }, [user, authLoading, router]);

  const checkAIPlan = async () => {
    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_plan_until, role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return;
    }

    const isAdmin = profile?.role === 'admin';
    const hasPlan = profile?.ai_plan_until 
      ? new Date(profile.ai_plan_until) > new Date()
      : false;

    setHasAIPlan(isAdmin || hasPlan);
    if (profile?.ai_plan_until) {
      setPlanUntil(profile.ai_plan_until);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login?redirect=/checkout/ai-pro');
      return;
    }

    if (hasAIPlan) {
      setError('이미 AI Pro 플랜을 사용 중입니다.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // v0에서는 실제 결제 없이 바로 플랜 활성화
      // 1개월 구독으로 설정 (현재 날짜 + 30일)
      const newPlanUntil = new Date();
      newPlanUntil.setMonth(newPlanUntil.getMonth() + 1);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ai_plan_until: newPlanUntil.toISOString() })
        .eq('id', user.id);

      if (updateError) {
        setError(`플랜 적용 중 오류가 발생했습니다: ${updateError.message}`);
        setProcessing(false);
        return;
      }

      // 구매 성공 - 마이페이지로 이동
      router.push('/app/mypage?plan=success');
    } catch (err) {
      setError(`예상치 못한 오류가 발생했습니다: ${err}`);
      setProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/pricing" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        요금제로 돌아가기
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 플랜 정보 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Pro 플랜
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    포함된 기능
                  </h3>
                  <ul className="space-y-2">
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
                      <span className="text-gray-600 dark:text-gray-400">주간/월간 리포트</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">패턴 분석 및 인사이트</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">AI 채팅 기능</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">우선 고객 지원</span>
                    </li>
                  </ul>
                </div>

                {hasAIPlan && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                          이미 AI Pro 플랜을 사용 중입니다
                        </p>
                        {planUntil && (
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            만료일: {new Date(planUntil).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 결제 요약 */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>결제 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">플랜</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    AI Pro (1개월)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">상품 금액</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    ₩9,900
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      총 결제금액
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₩9,900
                    </span>
                  </div>
                </div>
                <div className="pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    v0 버전에서는 실제 결제 없이 바로 플랜을 활성화할 수 있습니다.
                    향후 결제 시스템이 연동되면 실제 결제가 진행됩니다.
                  </p>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <Button
                    onClick={handlePurchase}
                    disabled={processing || hasAIPlan}
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {processing 
                      ? '처리 중...' 
                      : hasAIPlan 
                        ? '이미 사용 중' 
                        : '플랜 적용하기'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

