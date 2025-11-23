import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Tag, Info, Users2, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';

// 더미 데이터 - 회고 정보 (DB에 데이터가 없을 때 사용)
const dummyInfo = [
  {
    id: '1',
    title: '회고의 과학: 왜 회고가 성장에 중요한가',
    subtitle: '회고의 효과를 과학적으로 분석한 글',
    body: `
회고는 단순히 하루를 정리하는 것이 아닙니다. 뇌과학 연구에 따르면,
회고를 통해 경험을 재구성하고 의미를 부여하는 과정에서 새로운 인사이트가 생깁니다.
이 글에서는 회고가 왜 성장에 필수적인지 과학적 근거와 함께 설명합니다.
    `.trim(),
    category: '회고 방법론',
    created_at: '2024-02-15',
  },
  {
    id: '2',
    title: '효과적인 회고 템플릿 선택 가이드',
    subtitle: 'KPT, PMI, 자유 양식 중 나에게 맞는 템플릿 찾기',
    body: `
회고 템플릿은 목적에 따라 선택하는 것이 중요합니다.
KPT는 문제 해결에 집중할 때, PMI는 의사결정을 내릴 때,
자유 양식은 창의적인 사고가 필요할 때 효과적입니다.
각 템플릿의 특징과 활용법을 알아봅니다.
    `.trim(),
    category: '회고 방법론',
    created_at: '2024-02-10',
  },
  {
    id: '3',
    title: 'AI 회고 분석으로 발견한 나만의 패턴',
    subtitle: '데이터 기반 회고 분석의 힘',
    body: `
AI 분석을 통해 매주 반복되는 패턴을 발견했습니다.
예를 들어, 화요일에는 집중력이 높고, 목요일에는 창의적 작업에 적합하다는 것을 알게 되었어요.
이런 패턴을 활용해 일정을 최적화할 수 있게 되었습니다.
    `.trim(),
    category: 'AI 분석',
    created_at: '2024-02-05',
  },
];

// 더미 데이터 - 커뮤니티 소식
const dummyNews = [
  {
    id: '1',
    title: '9주 회고 챌린지 3기 모집 시작',
    subtitle: '함께 성장하는 회고 커뮤니티에 참여하세요',
    body: `
9주 회고 챌린지 3기가 시작됩니다! 매주 새로운 미션과 함께
회고 습관을 만들어가는 프로그램입니다. 커뮤니티에서 다른 참가자들과
경험을 공유하고 서로 응원하며 성장할 수 있습니다.
    `.trim(),
    category: '챌린지',
    created_at: '2024-02-20',
  },
  {
    id: '2',
    title: '회고 워크숍 2월 일정 안내',
    subtitle: '전문가와 함께하는 실전 회고 워크숍',
    body: `
회고 전문가와 함께하는 워크숍이 2월에 진행됩니다.
실제 회고 사례를 분석하고, 효과적인 회고 방법을 배울 수 있는
실습 중심의 워크숍입니다. 선착순 20명 모집합니다.
    `.trim(),
    category: '워크숍',
    created_at: '2024-02-18',
  },
  {
    id: '3',
    title: '커뮤니티 베스트 회고 선정',
    subtitle: '1월 가장 인기 있었던 회고 사례 공개',
    body: `
커뮤니티에서 가장 많은 공감과 조언을 받은 회고 사례를 선정했습니다.
이번 달 베스트 회고는 팀 협업 개선 사례였습니다.
다양한 관점의 피드백과 함께 성장한 이야기를 확인해보세요.
    `.trim(),
    category: '커뮤니티',
    created_at: '2024-02-12',
  },
];

// 더미 데이터 - 회고 사례
const dummyCases = [
  {
    id: '1',
    title: '회고로 성장한 개발자',
    subtitle: '매일 회고를 통해 문제 해결 능력이 크게 향상되었습니다',
    body: `
3개월간 매일 회고를 작성하면서 제가 가장 크게 느낀 변화는 문제 해결 능력의 향상이었습니다.
회고를 통해 매일의 문제점을 체계적으로 정리하고, 다음에 시도할 방법을 구체화하면서
자연스럽게 문제 해결 프로세스가 체화되었습니다.
    `.trim(),
    category: '커리어',
    is_featured: true,
    created_at: '2024-01-15',
  },
  {
    id: '2',
    title: '팀 회고로 협업이 개선되었어요',
    subtitle: '주간 회고를 통해 팀원들과의 소통이 훨씬 원활해졌습니다',
    body: `
우리 팀은 매주 금요일 팀 회고 시간을 가집니다. 각자 한 주를 돌아보고,
서로의 성과와 어려움을 공유하면서 팀의 응집력이 크게 높아졌습니다.
특히 문제가 생겼을 때 빠르게 파악하고 해결할 수 있게 되었어요.
    `.trim(),
    category: '팀 프로젝트',
    is_featured: true,
    created_at: '2024-01-20',
  },
  {
    id: '3',
    title: '회고 습관이 인생을 바꿨어요',
    subtitle: '일상의 작은 변화들이 모여 큰 성장으로 이어졌습니다',
    body: `
처음에는 회고가 부담스러웠지만, 하루 10분씩 투자하면서
제 삶의 패턴을 객관적으로 볼 수 있게 되었습니다.
이제는 회고 없이는 하루를 마무리할 수 없을 정도로 습관이 되었어요.
    `.trim(),
    category: '개인 회고',
    is_featured: true,
    created_at: '2024-01-25',
  },
  {
    id: '4',
    title: 'AI 분석으로 새로운 인사이트를 발견했습니다',
    subtitle: '주간 리포트를 통해 놓치고 있던 패턴을 발견할 수 있었어요',
    body: `
AI Pro 플랜을 사용하면서 주간 리포트를 받아보니,
제가 매주 반복되는 패턴이 있다는 것을 알게 되었습니다.
이를 바탕으로 더 효율적인 일정 관리를 할 수 있게 되었어요.
    `.trim(),
    category: 'AI 분석',
    is_featured: false,
    created_at: '2024-02-01',
  },
];

export default async function CasesPage() {
  const supabase = await createClient();
  
  // 회고 사례 데이터 가져오기
  const { data: cases, error: casesError } = await supabase
    .from('community_cases')
    .select('id, title, subtitle, body, category, is_featured, created_at')
    .order('created_at', { ascending: false });

  if (casesError) {
    console.error('Failed to fetch community cases:', casesError);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // DB에서 가져온 데이터 또는 더미 데이터 사용
  const displayCases = cases && cases.length > 0 ? cases : dummyCases;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 상단 소개 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          회고 칼럼
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          회고 정보, 커뮤니티 소식, 그리고 회고 사례를 한 곳에서 만나보세요.
        </p>
      </div>

      {/* 회고 정보 섹션 */}
      <section className="mb-16">
        <div className="flex items-center mb-6">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            회고 정보
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyInfo.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{item.category}</Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {item.subtitle}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 커뮤니티 소식 섹션 */}
      <section className="mb-16">
        <div className="flex items-center mb-6">
          <Users2 className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            커뮤니티 소식
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyNews.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow bg-purple-50 dark:bg-gray-800 border-purple-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default" className="bg-purple-600 dark:bg-purple-500">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {item.subtitle}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 회고 사례 섹션 */}
      <section>
        <div className="flex items-center mb-6">
          <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            회고 사례
          </h2>
        </div>
        
        {/* 추천 사례 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            추천 사례
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayCases
              .filter((c) => c.is_featured)
              .map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="default" className="bg-green-600 dark:bg-green-500">
                        추천
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(caseItem.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {caseItem.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {caseItem.subtitle}
                    </p>
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {caseItem.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* 전체 사례 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            전체 사례
          </h3>
          <div className="space-y-6">
            {displayCases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {caseItem.is_featured && (
                          <Badge variant="default" className="bg-green-600 dark:bg-green-500">
                            추천
                          </Badge>
                        )}
                        <Badge variant="outline">{caseItem.category}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(caseItem.created_at)}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {caseItem.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {caseItem.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {caseItem.body || caseItem.subtitle || ''}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
