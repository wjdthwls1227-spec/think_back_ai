'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ContentDetailClientProps {
  content: {
    id: string;
    slug: string;
    type: 'workbook' | 'cohort' | 'bundle';
    title: string;
    subtitle?: string | null;
    description?: string | null;
    thumbnail_image_url?: string | null;
    detail_image_url?: string | null;
    price: number;
  };
  isPurchased: boolean;
  userId?: string;
  typeLabels: Record<string, string>;
  typeIcons: Record<string, React.ComponentType<{ className?: string }>>;
  description: string;
  problem: string;
  benefit: string;
  curriculum: string[];
}

export function ContentDetailClient({
  content,
  isPurchased,
  userId,
  typeLabels,
  typeIcons,
  description,
  problem,
  benefit,
  curriculum,
}: ContentDetailClientProps) {
  const Icon = typeIcons[content.type];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handlePurchase = () => {
    if (!userId) {
      window.location.href = `/login?redirect=/contents/${content.slug}`;
    } else {
      window.location.href = `/checkout/${content.id}`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 뒤로가기 */}
      <Link href="/contents" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        콘텐츠 목록으로
      </Link>

      {/* 구매 완료 배지 */}
      {isPurchased && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            이미 구매한 콘텐츠입니다
          </span>
        </div>
      )}

      {/* 상품 헤더 */}
      <div className="mb-8">
        {/* 상세 이미지 */}
        {content.detail_image_url && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img 
              src={content.detail_image_url} 
              alt={content.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="flex items-center mb-4">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {typeLabels[content.type]}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {content.subtitle}
          </p>
        )}
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPrice(content.price)}원
          </span>
        </div>
      </div>

      {/* 소개 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            이 콘텐츠가 해결하는 문제
          </h2>
          <div 
            className="text-gray-600 dark:text-gray-400 mb-6 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: problem }}
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            기대되는 변화
          </h2>
          <div 
            className="text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: benefit }}
          />
        </CardContent>
      </Card>

      {/* 구성/커리큘럼 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {content.type === 'workbook' ? '목차' : content.type === 'cohort' ? '커리큘럼' : '포함 내용'}
          </h2>
          <ul className="space-y-2">
            {curriculum.map((item, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 상세 설명 */}
      {description && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              상세 설명
            </h2>
            <div 
              className="text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">최종 가격</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(content.price)}원
            </p>
          </div>
          {isPurchased ? (
            <Link href="/app/contents">
              <Button size="lg" variant="outline">
                내 콘텐츠에서 보기
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={handlePurchase}>
              지금 구매하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

