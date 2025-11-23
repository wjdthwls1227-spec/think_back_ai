import { createClient } from '@/lib/supabase-server';
import { ContentsList } from '@/components/contents/ContentsList';

// 더미 데이터 (DB에 데이터가 없을 때 사용)
const dummyContents = [
  {
    id: '1',
    slug: 'daily-retrospect-workbook',
    type: 'workbook' as const,
    title: '일일 회고 워크북',
    subtitle: '매일 10분으로 시작하는 회고 습관',
    price: 15000,
    badge: '베스트셀러',
  },
  {
    id: '2',
    slug: 'weekly-growth-cohort',
    type: 'cohort' as const,
    title: '주간 성장 커뮤니티',
    subtitle: '9주간 함께하는 회고 챌린지',
    price: 99000,
    badge: '인기',
  },
  {
    id: '3',
    slug: 'complete-retrospect-bundle',
    type: 'bundle' as const,
    title: '완전한 회고 패키지',
    subtitle: '워크북 + 커뮤니티 + AI 분석',
    price: 129000,
    badge: '추천',
  },
];

export default async function ContentsPage() {
  const supabase = await createClient();
  
  // is_published=true인 콘텐츠만 가져오기
  const { data: contents, error } = await supabase
    .from('contents')
    .select('id, slug, type, title, subtitle, price, is_published')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch contents:', error);
  }

  // DB에서 가져온 데이터를 더미 데이터 형식으로 변환
  const displayContents = contents && contents.length > 0
    ? contents.map((c) => ({
        id: c.id,
        slug: c.slug,
        type: c.type,
        title: c.title,
        subtitle: c.subtitle || '',
        price: c.price,
        badge: undefined as string | undefined,
        thumbnail_image_url: (c as any).thumbnail_image_url || null,
      }))
    : dummyContents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 상단 소개 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          회고 콘텐츠
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          체계적인 회고를 위한 워크북, 커뮤니티, 패키지를 만나보세요.<br />
          당신의 성장을 돕는 다양한 콘텐츠를 준비했습니다.
        </p>
      </div>

      {/* 콘텐츠 리스트 (클라이언트 컴포넌트로 필터링 기능 제공) */}
      <ContentsList initialContents={displayContents} />
    </div>
  );
}

