import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Package, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { Progress } from '@/components/ui/progress';
import type { UserContent, Content } from '@/types';

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

export default async function MyContentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 내 콘텐츠 조회 (user_contents + contents join)
  const { data: userContents, error } = await supabase
    .from('user_contents')
    .select(`
      id,
      progress,
      started_at,
      completed_at,
      contents (
        id,
        slug,
        type,
        title,
        subtitle
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user contents:', error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          내 콘텐츠
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          구매한 회고 콘텐츠를 확인하고 이어서 학습하세요.
        </p>
      </div>

      {userContents && userContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userContents.map((uc: UserContent & { contents: Content }) => {
            const content = uc.contents;
            if (!content) return null;

            const Icon = typeIcons[content.type as keyof typeof typeIcons];
            const typeLabel = typeLabels[content.type as keyof typeof typeLabels];

            return (
              <Card key={uc.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {typeLabel}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2">{content.title}</CardTitle>
                  {content.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {content.subtitle}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">진행률</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {uc.progress}%
                      </span>
                    </div>
                    <Progress value={uc.progress} className="h-2" />
                  </div>
                  <Link href={`/contents/${content.slug}`}>
                    <Button variant="outline" className="w-full">
                      이어보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              아직 구매한 콘텐츠가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              회고 콘텐츠를 구매하고 체계적인 회고를 시작해보세요.
            </p>
            <Link href="/contents">
              <Button>
                콘텐츠 둘러보기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

