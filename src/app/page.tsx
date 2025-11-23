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
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            성장하는 사람들의<br />
            회고 알고리즘 플랫폼
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            ThinkBack AI로 매일의 경험을 성장의 자산으로 바꾸세요.<br />
            AI 기반 분석으로 더 깊은 인사이트를 얻을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            {user ? (
              <Link href="/app/journal">
                <Button size="lg" className="w-full sm:w-auto">
                  3분 만에 회고 시작하기
                </Button>
              </Link>
            ) : (
              <Link href="/login?redirect=/app/journal">
                <Button size="lg" className="w-full sm:w-auto">
                  3분 만에 회고 시작하기
                </Button>
              </Link>
            )}
            <Link href="/contents">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                회고 콘텐츠 살펴보기
              </Button>
            </Link>
          </div>

          {/* 목업 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">오늘 회고</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  오늘 하루를 돌아보며 성장의 순간을 기록하세요
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI 분석 요약</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI가 회고를 분석해 핵심 인사이트를 제공합니다
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">이번 주 패턴</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  주간 리포트로 성장 패턴을 파악하세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About 섹션 */}
      <section id="about" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            회고리즘은 이런 사람을 위해 만들었다
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 왼쪽: 타깃 */}
            <div className="space-y-6">
              <div className="flex items-start">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    꾸준한 성장을 원하는 사람
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    매일의 경험을 성장의 자산으로 만들고 싶은 분
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    체계적인 회고를 원하는 사람
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    구조화된 템플릿으로 효율적인 회고를 하고 싶은 분
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    AI 인사이트를 활용하고 싶은 사람
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    데이터 기반으로 자신의 패턴을 파악하고 싶은 분
                  </p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 기능 카드 */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    개인 회고 템플릿
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    KPT, PMI, 자유 양식 등 다양한 템플릿으로 체계적인 회고를 작성하세요
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    AI 기반 회고 분석
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI가 회고를 분석해 핵심 패턴과 개선점을 제안합니다
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-gray-800 border-green-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2">
                    팀 회고 리포트
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    팀원들과 함께 회고를 공유하고 조직의 성장을 이끌어보세요
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
      <section id="community" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            우리는 혼자 회고하지 않는다
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            챌린지, 워크숍, 온라인 커뮤니티를 통해 함께 성장하세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">
                  9주 회고 챌린지
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  9주 동안 꾸준히 회고하며 습관을 만드는 챌린지
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  참여자: 1,234명
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <Users2 className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
                <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">
                  회고 워크숍
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  전문가와 함께하는 실전 회고 워크숍
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  누적 회고: 5,678개
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <BookOpen className="w-10 h-10 text-green-600 dark:text-green-400 mb-4" />
                <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">
                  온라인 커뮤니티
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  회고 경험을 공유하고 서로 응원하는 커뮤니티
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  활성 멤버: 890명
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 회고 도구 추천 섹션 */}
      <section id="tools" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            회고를 도와주는 도구들
          </h2>
          <RetrospectTools />
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-2">
            © {new Date().getFullYear()} ThinkBack AI · 회고리즘
          </p>
          <p className="text-sm text-gray-500">
            제휴 링크 안내: 일부 링크는 쿠팡파트너스 등 제휴 프로그램을 통해 수수료를 받을 수 있습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
