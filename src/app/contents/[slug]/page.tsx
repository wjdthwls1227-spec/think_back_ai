import { use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Package, Check, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { ContentDetailClient } from '@/components/contents/ContentDetailClient';

const typeLabels = {
  workbook: '워크북',
  cohort: '커뮤니티',
  bundle: '패키지',
};

const typeIcons = {
  workbook: BookOpen,
  cohort: Users,
  bundle: Package,
};

export default async function ContentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  
  // slug로 콘텐츠 조회
  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !content) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              콘텐츠를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              요청하신 콘텐츠가 존재하지 않거나 비공개 상태입니다.
            </p>
            <Link href="/contents">
              <Button variant="outline">
                콘텐츠 목록으로
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 사용자 정보 및 구매 여부 확인
  const { data: { user } } = await supabase.auth.getUser();
  let isPurchased = false;
  
  if (user) {
    const { data: userContent } = await supabase
      .from('user_contents')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_id', content.id)
      .single();
    
    isPurchased = !!userContent;
  }

  // meta에서 추가 정보 추출 (없으면 기본값 사용)
  const meta = content.meta as Record<string, unknown> | null;
  const description = (meta?.description as string) || content.description || '';
  const problem = (meta?.problem as string) || '회고를 시작하고 싶지만 어떻게 해야 할지 모르겠다면';
  const benefit = (meta?.benefit as string) || '체계적인 회고 습관을 만들고, 매일의 성장을 기록할 수 있습니다';
  const curriculum = (meta?.curriculum as string[]) || [
    '1주차: 회고의 기초',
    '2주차: KPT 템플릿 활용',
    '3주차: PMI 템플릿 활용',
    '4주차: 자유 양식 회고',
  ];

  return (
    <ContentDetailClient
      content={{
        ...content,
        thumbnail_image_url: (content as any).thumbnail_image_url || null,
        detail_image_url: (content as any).detail_image_url || null,
      }}
      isPurchased={isPurchased}
      userId={user?.id}
      typeLabels={typeLabels}
      typeIcons={typeIcons}
      description={description}
      problem={problem}
      benefit={benefit}
      curriculum={curriculum}
    />
  );
}

