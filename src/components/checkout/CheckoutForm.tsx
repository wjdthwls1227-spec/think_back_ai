'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface CheckoutFormProps {
  contentId: string;
  contentSlug: string;
  price: number;
}

export function CheckoutForm({ contentId, contentSlug, price }: CheckoutFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/login?redirect=/checkout/${contentSlug}`);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // v0에서는 orders/order_items 생략하고 바로 user_contents에 추가
      const { data, error: insertError } = await supabase
        .from('user_contents')
        .insert({
          user_id: user.id,
          content_id: contentId,
          progress: 0,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        // 이미 구매한 경우 무시
        if (insertError.code === '23505') {
          // Unique constraint violation
          router.push('/app/contents');
          return;
        }
        setError(`구매 중 오류가 발생했습니다: ${insertError.message}`);
        setProcessing(false);
        return;
      }

      // 구매 성공 - 내 콘텐츠 페이지로 이동
      router.push('/app/contents');
    } catch (err) {
      setError(`예상치 못한 오류가 발생했습니다: ${err}`);
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            구매하기
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            v0 버전에서는 실제 결제 없이 바로 콘텐츠를 구매할 수 있습니다.
            향후 결제 시스템이 연동되면 실제 결제가 진행됩니다.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <Button
          onClick={handlePurchase}
          disabled={processing}
          size="lg"
          className="w-full"
        >
          {processing ? '처리 중...' : '구매 완료하기'}
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
          구매하시면 내 콘텐츠에서 바로 확인하실 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );
}

