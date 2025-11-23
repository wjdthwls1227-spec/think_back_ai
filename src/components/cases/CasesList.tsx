'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import Link from 'next/link';

// 카테고리별 색상 매핑
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '회고정보': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-700' },
  '커뮤니티소식': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-700' },
  '회고 사례': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700' },
  '기타': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-700' },
};

// 기본 카테고리 색상
const defaultColor = { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-700' };

// 카테고리별 아이콘
const categoryIcons: Record<string, string> = {
  '회고정보': '📚',
  '커뮤니티소식': '💬',
  '회고 사례': '✨',
  '기타': '📝',
};

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

export function CasesList({ cases, selectedCategory = '전체' }: { cases: CaseItem[]; selectedCategory?: string }) {
  // 카테고리 필터링
  const filteredCases = useMemo(() => {
    if (selectedCategory === '전체') {
      return cases;
    }
    return cases.filter((caseItem) => caseItem.category === selectedCategory);
  }, [cases, selectedCategory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 본문에서 HTML 태그 제거하고 텍스트만 추출 (미리보기용)
  const getPreviewText = (html: string | null | undefined): string => {
    if (!html) return '';
    // 간단한 HTML 태그 제거
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  if (filteredCases.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {selectedCategory === '전체' ? '등록된 칼럼이 없습니다.' : `${selectedCategory} 카테고리의 칼럼이 없습니다.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCases.map((caseItem) => {
        const categoryColor = caseItem.category 
          ? categoryColors[caseItem.category] || defaultColor
          : defaultColor;
        const categoryIcon = caseItem.category 
          ? categoryIcons[caseItem.category] || '📄'
          : '📄';

        return (
          <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group">
              <CardContent className="p-6 flex flex-col h-full">
                {/* 카테고리 배지 및 이미지 영역 */}
                <div className="mb-4 relative">
                  {caseItem.image_url ? (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={caseItem.image_url}
                        alt={caseItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-48 rounded-lg mb-3 ${categoryColor.bg} flex items-center justify-center text-6xl`}>
                      {categoryIcon}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}
                    >
                      {caseItem.category || '기타'}
                    </Badge>
                    {caseItem.is_featured && (
                      <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                        ⭐ 추천
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {caseItem.title}
                </h3>

                {/* 부제목 */}
                {caseItem.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {caseItem.subtitle}
                  </p>
                )}

                {/* 본문 미리보기 */}
                {caseItem.body && (
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: getPreviewText(caseItem.body).replace(/\n/g, '<br>')
                    }}
                  />
                )}

                {/* 날짜 */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(caseItem.created_at)}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

