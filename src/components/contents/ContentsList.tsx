'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Package, Calendar } from 'lucide-react';
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

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  'workbook': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-700' },
  'cohort': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-700' },
  'bundle': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700' },
};

const defaultColor = { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-700' };

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

export function ContentsList({ contents, selectedType }: { contents: ContentItem[]; selectedType: string }) {
  // 타입 필터링
  const filteredContents = useMemo(() => {
    if (selectedType === '전체') {
      return contents;
    }
    const typeMap: Record<string, 'workbook' | 'cohort' | 'bundle'> = {
      '워크북': 'workbook',
      '커뮤니티': 'cohort',
      '패키지': 'bundle',
    };
    const targetType = typeMap[selectedType];
    return contents.filter((content) => content.type === targetType);
  }, [contents, selectedType]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

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
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  if (filteredContents.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {selectedType === '전체' ? '등록된 콘텐츠가 없습니다.' : `${selectedType} 카테고리의 콘텐츠가 없습니다.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContents.map((content) => {
        const Icon = typeIcons[content.type];
        const typeColor = typeColors[content.type] || defaultColor;

        return (
          <Link key={content.id} href={`/contents/${content.slug}`}>
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group">
              <CardContent className="p-6 flex flex-col h-full">
                {/* 이미지 영역 */}
                <div className="mb-4 relative">
                  {content.thumbnail_image_url ? (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={content.thumbnail_image_url}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-48 rounded-lg mb-3 ${typeColor.bg} flex items-center justify-center`}>
                      <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`${typeColor.bg} ${typeColor.text} ${typeColor.border} border`}
                    >
                      {typeLabels[content.type]}
                    </Badge>
                  </div>
                </div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {content.title}
                </h3>

                {/* 부제목 */}
                {content.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {content.subtitle}
                  </p>
                )}

                {/* 설명 미리보기 */}
                {content.description && (
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: getPreviewText(content.description).replace(/\n/g, '<br>')
                    }}
                  />
                )}

                {/* 가격 및 날짜 */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(content.price)}원
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(content.created_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
