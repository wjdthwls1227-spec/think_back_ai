import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ArrowLeft, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 카테고리별 색상 매핑
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  '회고정보': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-700' },
  '커뮤니티소식': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-700' },
  '회고 사례': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-700' },
  '기타': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-700' },
};

const defaultColor = { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-700' };

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: caseItem, error } = await supabase
    .from('community_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !caseItem) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const categoryColor = caseItem.category 
    ? categoryColors[caseItem.category] || defaultColor
    : defaultColor;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/cases">
            <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Badge 
              className={`${categoryColor.bg} ${categoryColor.text} ${categoryColor.border} border`}
            >
              {caseItem.category || '기타'}
            </Badge>
            {caseItem.is_featured && (
              <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
                <Star className="w-3 h-3 mr-1" />
                추천
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {caseItem.title}
          </h1>
          
          {caseItem.subtitle && (
            <p className="text-lg sm:text-xl text-blue-100 dark:text-gray-300 mb-4">
              {caseItem.subtitle}
            </p>
          )}

          <div className="flex items-center text-sm text-blue-100 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(caseItem.created_at)}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 md:p-12">
          {caseItem.body && (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: caseItem.body }}
            />
          )}
        </article>

        {/* 하단 네비게이션 */}
        <div className="mt-8 flex justify-center">
          <Link href="/cases">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

