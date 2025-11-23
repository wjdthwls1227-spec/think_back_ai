import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';

export async function CommunityCasesSection() {
  const supabase = await createClient();
  
  // is_featured=true인 사례 3개만 가져오기
  const { data: featuredCases, error } = await supabase
    .from('community_cases')
    .select('id, title, subtitle, category')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Failed to fetch community cases:', error);
  }

  const cases = featuredCases || [];

  return (
    <section id="contents" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          회고리즘으로 변화한 사람들
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cases.length > 0 ? (
            cases.map((caseItem) => (
              <Card key={caseItem.id} className="bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {caseItem.subtitle || '"회고를 통해 성장하는 사람들의 이야기"'}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {caseItem.category || '회고 사례'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            // 데이터가 없을 때 기본 메시지
            [1, 2, 3].map((i) => (
              <Card key={i} className="bg-white dark:bg-gray-900">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    회고로 성장한 개발자 {i}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    &quot;매일 회고를 통해 문제 해결 능력이 크게 향상되었습니다&quot;
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    개인 회고 · 커리어
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div className="text-center">
          <Link href="/cases">
            <Button variant="outline" size="lg">
              더 많은 사례 보기
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

