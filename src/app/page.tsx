import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, BarChart3, Users, Target, Sparkles, TrendingUp, BookOpen, Users2, Calendar } from 'lucide-react';
import { RetrospectTools } from '@/components/RetrospectTools';
import { createClient } from '@/lib/supabase-server';
import { CommunityCasesSection } from '@/components/home/CommunityCasesSection';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="w-full">
      {/* Hero 섹션 */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 dark:text-white mb-6 leading-tight">
            하루 3분,<br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>회고로 성장하세요
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            매일의 경험을 기록하고, AI가 감정과 패턴을 분석해<br className="hidden sm:block" />
            <span className="hidden sm:inline"> </span>다음 행동까지 제안해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-16">
            {user ? (
              <Link href="/app/journal">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  회고 시작하기
                </Button>
              </Link>
            ) : (
              <Link href="/login?redirect=/app/journal">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  무료로 시작하기
                </Button>
              </Link>
            )}
            <Link href="/contents">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                콘텐츠 보기
              </Button>
            </Link>
          </div>

          {/* 핵심 기능 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mr-2 sm:mr-3" />
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">3분 회고</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  오늘 있었던 일, 감정, 에너지를 짧게 남기면 됩니다. 형식은 회고리즘이 대신 잡아줍니다.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" />
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">AI 분석</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  여러 날의 회고를 묶어 감정·지출·행동 패턴을 요약하고 핵심 인사이트를 제공합니다.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mr-2 sm:mr-3" />
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">성장 제안</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  어디서 에너지가 새는지, 무엇을 줄이고 늘려야 할지 구체적인 제안을 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About 섹션 */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-4 sm:mb-6">
            이런 분에게 필요합니다
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
            기록은 많이 해봤지만, 정리와 인사이트까지 이어지지 않았던 분들을 위해 만들었습니다.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* 왼쪽: 타깃 */}
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-start gap-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-2">
                    바쁘게 살지만 뭔가 쌓이는 느낌이 없어요
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    매일의 경험을 성장의 자산으로 만들고 싶은 분
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-2">
                    일기나 노션을 여러 번 시작했지만 포기했어요
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    구조화된 템플릿으로 효율적인 회고를 하고 싶은 분
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-2">
                    감정과 지출, 일을 한 번에 보고 싶어요
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    데이터 기반으로 자신의 패턴을 파악하고 싶은 분
                  </p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 기능 카드 */}
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              <Card className="bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <CardContent className="p-6 sm:p-8">
                  <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400 mb-4 sm:mb-6" />
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                    개인 회고 템플릿
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    KPT, PMI, 자유 양식 등 다양한 템플릿으로 체계적인 회고를 작성하세요.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                <CardContent className="p-6 sm:p-8">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 mb-4 sm:mb-6" />
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                    AI 기반 회고 분석
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    AI가 회고를 분석해 핵심 패턴과 개선점을 제안합니다.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-gray-800 border-green-200 dark:border-gray-700">
                <CardContent className="p-6 sm:p-8">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400 mb-4 sm:mb-6" />
                  <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                    팀 회고 리포트
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    팀원들과 함께 회고를 공유하고 조직의 성장을 이끌어보세요.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 콘텐츠/사례 섹션 */}
      <CommunityCasesSection />

      {/* 커뮤니티 섹션 */}
      <section id="community" className="py-16 sm:py-24 px-4 sm:px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-4 sm:mb-6">
            혼자 회고하지 않습니다
          </h2>
          <p className="text-center text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed">
            챌린지, 워크숍, 온라인 커뮤니티를 통해 함께 성장하세요.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6 sm:p-8">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 mb-4 sm:mb-6" />
                <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                  9주 회고 챌린지
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                  9주 동안 꾸준히 회고하며 습관을 만드는 챌린지입니다.
                </p>
                <div className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                  참여자: 1,234명
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6 sm:p-8">
                <Users2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400 mb-4 sm:mb-6" />
                <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                  회고 워크숍
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                  전문가와 함께하는 실전 회고 워크숍입니다.
                </p>
                <div className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                  누적 회고: 5,678개
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8">
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400 mb-4 sm:mb-6" />
                <h3 className="font-semibold text-lg sm:text-xl text-gray-900 dark:text-gray-100 mb-3">
                  온라인 커뮤니티
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                  회고 경험을 공유하고 서로 응원하는 커뮤니티입니다.
                </p>
                <div className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                  활성 멤버: 890명
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 회고 도구 추천 섹션 */}
      <section id="tools" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-gray-900 dark:text-white mb-12 sm:mb-16">
            회고를 도와주는 도구들
          </h2>
          <RetrospectTools />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-base sm:text-lg text-gray-400 mb-3 sm:mb-4">
            © {new Date().getFullYear()} ThinkBack AI · 회고리즘
          </p>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            제휴 링크 안내: 일부 링크는 쿠팡파트너스 등 제휴 프로그램을 통해 수수료를 받을 수 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
