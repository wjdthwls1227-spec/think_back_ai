'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Users, Package, ArrowRight } from 'lucide-react';

type ContentType = 'all' | 'workbook' | 'cohort' | 'bundle';

const typeLabels: Record<ContentType, string> = {
  all: '전체',
  workbook: '워크북',
  cohort: '커뮤니티',
  bundle: '패키지',
};

const typeIcons = {
  workbook: BookOpen,
  cohort: Users,
  bundle: Package,
};

interface Content {
  id: string;
  slug: string;
  type: 'workbook' | 'cohort' | 'bundle';
  title: string;
  subtitle: string;
  price: number;
  badge?: string;
  thumbnail_image_url?: string | null;
}

interface ContentsListProps {
  initialContents: Content[];
}

export function ContentsList({ initialContents }: ContentsListProps) {
  const [selectedType, setSelectedType] = useState<ContentType>('all');

  const filteredContents = selectedType === 'all'
    ? initialContents
    : initialContents.filter(content => content.type === selectedType);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <>
      {/* 필터/탭 */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(['all', 'workbook', 'cohort', 'bundle'] as ContentType[]).map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            onClick={() => setSelectedType(type)}
          >
            {typeLabels[type]}
          </Button>
        ))}
      </div>

      {/* 카드 리스트 */}
      {filteredContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => {
            const Icon = typeIcons[content.type];
            return (
              <Card key={content.id} className="hover:shadow-lg transition-shadow flex flex-col">
                {content.thumbnail_image_url && (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img 
                      src={content.thumbnail_image_url} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {typeLabels[content.type]}
                      </span>
                    </div>
                    {content.badge && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {content.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {content.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {content.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(content.price)}원
                    </span>
                  </div>
                  <Link href={`/contents/${content.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      자세히 보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            선택한 카테고리에 해당하는 콘텐츠가 없습니다.
          </p>
        </div>
      )}
    </>
  );
}

