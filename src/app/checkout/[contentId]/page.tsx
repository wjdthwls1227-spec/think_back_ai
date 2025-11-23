import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { BookOpen, Users, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const typeIcons = {
  workbook: BookOpen,
  cohort: Users,
  bundle: Package,
};

const typeLabels = {
  workbook: '워크북',
  cohort: '커뮤니티',
  bundle: '패키지',
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/checkout/${contentId}`);
  }

  // 콘텐츠 조회 (id로 조회)
  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentId)
    .eq('is_published', true)
    .single();

  if (error || !content) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              콘텐츠를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              요청하신 콘텐츠가 존재하지 않거나 공개되지 않았습니다.
            </p>
            <Link href="/contents">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                콘텐츠 목록으로
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 이미 구매한 콘텐츠인지 확인
  const { data: existingPurchase } = await supabase
    .from('user_contents')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', content.id)
    .single();

  if (existingPurchase) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              이미 구매한 콘텐츠입니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              이 콘텐츠는 이미 구매하셨습니다. 내 콘텐츠에서 확인하실 수 있습니다.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/app/contents">
                <Button>
                  내 콘텐츠 보기
                </Button>
              </Link>
              <Link href="/contents">
                <Button variant="outline">
                  다른 콘텐츠 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = typeIcons[content.type as keyof typeof typeIcons];
  const typeLabel = typeLabels[content.type as keyof typeof typeLabels];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/contents/${contentId}`} className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        콘텐츠 상세로
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 주문 정보 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>주문 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {typeLabel}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {content.title}
                    </h2>
                    {content.subtitle && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {content.subtitle}
                      </p>
                    )}
                  </div>
                </div>
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
                  <span className="text-gray-600 dark:text-gray-400">상품 금액</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {formatPrice(content.price)}원
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      총 결제금액
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(content.price)}원
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 구매 폼 */}
      <div className="mt-8">
        <CheckoutForm contentId={content.id} contentSlug={content.slug} price={content.price} />
      </div>
    </div>
  );
}

