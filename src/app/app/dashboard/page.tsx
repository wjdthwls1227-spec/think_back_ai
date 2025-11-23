import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 최근 회고 조회 (최근 3개)
  const { data: recentJournals, error: journalsError } = await supabase
    .from('journals')
    .select('id, date, type, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (journalsError) {
    console.error('Error fetching recent journals:', journalsError);
  }

  // 내 콘텐츠 개수 조회
  const { count: contentCount } = await supabase
    .from('user_contents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 총 회고 개수 조회
  const { count: totalJournalCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // 이번 주 회고 개수 조회
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const { count: weeklyJournalCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('date', startOfWeek.toISOString().split('T')[0]);

  return (
    <div>
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          오늘 하루도 회고로 정리해볼까요?
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          매일의 경험을 성장의 자산으로 만들어보세요.
        </p>
      </div>

      {/* 카드 3개 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 오늘 회고 작성하기 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center mb-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
              <CardTitle className="text-xl">오늘 회고 작성하기</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              오늘 하루를 돌아보며 성장의 순간을 기록하세요.
            </p>
            <Link href="/app/journal">
              <Button className="w-full">
                회고 작성하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 최근 회고 리스트 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
              <CardTitle className="text-xl">최근 회고</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentJournals && recentJournals.length > 0 ? (
              <div className="space-y-3">
                {recentJournals.map((journal) => (
                  <div 
                    key={journal.id} 
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {journal.title || '제목 없음'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(journal.date).toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                        })} · {journal.type === 'daily' ? '일일' : journal.type === 'weekly' ? '주간' : '월간'}
                      </p>
                    </div>
                    <Link href="/history">
                      <Button variant="ghost" size="sm">
                        보기
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">
                  아직 작성한 회고가 없습니다.
                </p>
                <Link href="/app/journal">
                  <Button size="sm">
                    첫 회고 작성하기
                  </Button>
                </Link>
              </div>
            )}
            {recentJournals && recentJournals.length > 0 && (
              <Link href="/history" className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full">
                  전체 보기
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* 내 회고 콘텐츠 요약 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center mb-2">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
              <CardTitle className="text-xl">내 콘텐츠</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {contentCount || 0}개
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                구매한 콘텐츠
              </p>
            </div>
            <Link href="/app/contents">
              <Button variant="outline" className="w-full">
                콘텐츠 보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 통계 섹션 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>나의 회고 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalJournalCount || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                총 회고 수
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {weeklyJournalCount || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                이번 주 회고
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {contentCount || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                구매한 콘텐츠
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/app/journal">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                새 회고 작성
              </Button>
            </Link>
            <Link href="/app/contents">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                내 콘텐츠 보기
              </Button>
            </Link>
            <Link href="/app/mypage">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                마이페이지
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full justify-start">
                <ArrowRight className="w-4 h-4 mr-2" />
                요금제 확인
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

