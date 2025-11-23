'use client';

import { useState } from 'react';
import { CategoryFilter } from './CategoryFilter';
import { CasesList } from './CasesList';

interface CaseItem {
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  category?: string | null;
  is_featured: boolean;
  image_url?: string | null;
  created_at: string;
}

export function CasesPageClient({ initialCases }: { initialCases: CaseItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            회고 칼럼
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            회고 정보, 커뮤니티 소식, 그리고 회고 사례를 한 곳에서 만나보세요.
          </p>
        </div>
      </div>

      {/* 카테고리 필터 바 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CasesList cases={initialCases} selectedCategory={selectedCategory} />
      </div>
    </div>
  );
}

