'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, CreditCard, BookOpen, LogOut, Sparkles, FileText, Calendar, TrendingUp, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogoutButton } from '@/components/auth/LogoutButton';
import type { Profile, Content, Journal } from '@/types';

function MyPageContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userContents, setUserContents] = useState<Array<{ id: string; contents: Content }>>([]);
  const [contentCount, setContentCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [recentJournals, setRecentJournals] = useState<Journal[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // URL 파라미터에서 성공 메시지 확인
    if (searchParams.get('plan') === 'success') {
      setShowSuccessMessage(true);
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', '/app/mypage');
      // 5초 후 자동으로 메시지 숨김
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || !user) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // 프로필 정보 조회
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, name, display_name, avatar_url, role, ai_plan_until, signup_path, created_at, updated_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
        } else if (profileData) {
          setProfile(profileData as Profile);
        }

        // 내 콘텐츠 조회
        const { data: contentsData, count, error: contentsError } = await supabase
          .from('user_contents')
          .select('id, contents(id, title, type, slug)', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (contentsError) {
          console.error('User contents fetch error:', contentsError);
        } else if (contentsData) {
          // Supabase join 결과에서 contents가 배열일 수 있으므로 첫 번째 요소 사용
          const processedContents = contentsData.map((uc: any) => ({
            id: uc.id,
            contents: Array.isArray(uc.contents) ? uc.contents[0] : uc.contents,
          })).filter((uc: any) => uc.contents); // contents가 있는 것만 필터링
          setUserContents(processedContents);
          setContentCount(count || 0);
        }

        // 회고 통계 조회
        const { count: journalCountData, error: journalCountError } = await supabase
          .from('journals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (journalCountError) {
          console.error('Journal count error:', journalCountError);
        } else {
          setJournalCount(journalCountData || 0);
        }

        // 최근 회고 조회 (최근 3개)
        const { data: journalsData, error: recentJournalsError } = await supabase
          .from('journals')
          .select('id, date, type, title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentJournalsError) {
          console.error('Recent journals error:', recentJournalsError);
        } else {
          setRecentJournals(journalsData || []);
        }
      } catch (error) {
        console.error('MyPage data loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            마이페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            로그인이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  // AI 플랜 확인 (어드민은 자동으로 사용 가능)
  const isAdmin = profile?.role === 'admin';
  const hasAIPlan = isAdmin || (profile?.ai_plan_until 
    ? new Date(profile.ai_plan_until) > new Date()
    : false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 가입일 계산
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          마이페이지
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          프로필, 요금제, 콘텐츠 정보를 확인하고 관리하세요.
        </p>
      </div>

      {/* 구매 성공 메시지 */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">
                  AI Pro 플랜이 성공적으로 적용되었습니다!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  이제 AI 분석 기능을 무제한으로 사용하실 수 있습니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">작성한 회고</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {journalCount || 0}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">구매한 콘텐츠</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {contentCount || 0}
                </p>
              </div>
              <BookOpen className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">현재 플랜</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {hasAIPlan ? 'AI Pro' : 'Free'}
                </p>
              </div>
              <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 프로필 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <CardTitle>프로필</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이름
                </label>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {profile?.display_name || profile?.email || user.email}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  이메일
                </label>
                <p className="text-lg text-gray-900 dark:text-white mt-1">
                  {profile?.email || user.email}
                </p>
              </div>
              {joinDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    가입일
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white mt-1">
                    {joinDate}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 요금제 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <CardTitle>요금제</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    현재 플랜
                  </span>
                  {hasAIPlan ? (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm font-semibold flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Pro
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm font-semibold">
                      Free
                    </span>
                  )}
                </div>
                {hasAIPlan && profile?.ai_plan_until && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    만료일: {formatDate(profile.ai_plan_until)}
                  </p>
                )}
              </div>
              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  요금제 변경하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 내 콘텐츠 요약 섹션 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <CardTitle>내 콘텐츠 요약</CardTitle>
              </div>
              <Link href="/app/contents">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {contentCount || 0}개
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                구매한 콘텐츠
              </p>
            </div>
            {userContents && userContents.length > 0 ? (
              <div className="space-y-2">
                {userContents.map((uc: any) => {
                  const content = uc.contents;
                  if (!content) return null;
                  return (
                    <div
                      key={uc.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block">
                          {content.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {content.type === 'workbook' ? '워크북' : content.type === 'cohort' ? '커뮤니티' : '패키지'}
                        </span>
                      </div>
                      <Link href={`/contents/${content.slug}`}>
                        <Button variant="ghost" size="sm">
                          보기
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                아직 구매한 콘텐츠가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 최근 회고 섹션 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                <CardTitle>최근 회고</CardTitle>
              </div>
              <Link href="/app/journal">
                <Button variant="ghost" size="sm">
                  회고 작성하기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentJournals && recentJournals.length > 0 ? (
              <div className="space-y-3">
                {recentJournals.map((journal) => (
                  <div
                    key={journal.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {journal.title || '제목 없음'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(journal.date)} · {journal.type === 'daily' ? '일일' : journal.type === 'weekly' ? '주간' : '월간'}
                        </p>
                      </div>
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
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  아직 작성한 회고가 없습니다.
                </p>
                <Link href="/app/journal">
                  <Button size="sm">
                    첫 회고 작성하기
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 계정 섹션 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <CardTitle>계정</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyPageContent />
    </Suspense>
  );
}

