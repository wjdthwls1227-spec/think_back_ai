'use client';

import { useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { ContentsList } from './ContentsList';

interface ContentItem {
  id: string;
  slug: string;
  type: 'workbook' | 'cohort' | 'bundle';
  title: string;
  subtitle?: string | null;
  description?: string | null;
  price: number;
  thumbnail_image_url?: string | null;
  detail_image_url?: string | null;
  is_published: boolean;
  created_at: string;
}

export function ContentsPageClient({ initialContents }: { initialContents: ContentItem[] }) {
  const [selectedType, setSelectedType] = useState<string>('전체');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            회고 콘텐츠
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            체계적인 회고를 위한 워크북, 커뮤니티, 패키지를 만나보세요.<br />
            당신의 성장을 돕는 다양한 콘텐츠를 준비했습니다.
          </p>
        </div>
      </div>

      {/* 카테고리 필터 바 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <CategoryFilter 
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentsList contents={initialContents} selectedType={selectedType} />
      </div>
    </div>
  );
}

