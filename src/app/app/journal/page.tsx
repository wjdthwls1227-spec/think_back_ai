'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FreeTemplate } from '@/components/retrospective/FreeTemplate';
import { KPTTemplate } from '@/components/retrospective/KPTTemplate';
import { PMITemplate } from '@/components/retrospective/PMITemplate';
import { FourLTemplate } from '@/components/retrospective/FourLTemplate';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { FreeContent, KPTContent, PMIContent, FourLContent } from '@/types';
import { Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { RetrospectLayout } from '@/components/retrospect/RetrospectLayout';
import { Input } from '@/components/ui/input';

type TemplateType = 'FREE' | 'KPT' | 'PMI' | '4L';

export default function JournalPage() {
  const { user } = useAuth();
  const [templateType, setTemplateType] = useState<TemplateType>('FREE');
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [journalId, setJournalId] = useState<string | null>(null);
  const [hasAIPlan, setHasAIPlan] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const selectedDateFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // AI 플랜 확인 (어드민은 자동으로 사용 가능)
  useEffect(() => {
    if (!user) return;

    const checkAIPlan = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_plan_until, role')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      const hasPlan = profile?.ai_plan_until 
        ? new Date(profile.ai_plan_until) > new Date()
        : false;
      
      // 어드민이거나 AI 플랜이 있으면 사용 가능
      setHasAIPlan(isAdmin || hasPlan);
    };

    checkAIPlan();
  }, [user]);

  // 제목과 날짜가 변경될 때마다 해당 제목의 회고 조회
  useEffect(() => {
    if (!user || !title.trim()) {
      setJournalId(null);
      return;
    }

    const loadJournalByTitle = async () => {
      const { data, error } = await supabase
        .from('journals')
        .select('id, title, content')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .eq('type', 'daily')
        .eq('title', title.trim())
        .maybeSingle();

      if (error) {
        console.error('Error loading journal by title:', error);
        return;
      }

      if (data) {
        setJournalId(data.id);
      } else {
        // 같은 제목의 회고가 없으면 새로 작성
        setJournalId(null);
      }
    };

    // 제목 입력 후 500ms 디바운스
    const timeoutId = setTimeout(() => {
      loadJournalByTitle();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [user, selectedDate, title]);

  const handleSave = async (content: FreeContent | KPTContent | PMIContent | FourLContent) => {
    if (!user) {
      setSavedMessage('로그인이 필요합니다.');
      return;
    }

    if (!title.trim()) {
      setSavedMessage('제목을 입력해주세요.');
      return;
    }

    setSaving(true);
    setSavedMessage('');

    try {
      // 저장 시점에 같은 제목의 회고가 있는지 다시 확인
      const { data: existingJournal } = await supabase
        .from('journals')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .eq('type', 'daily')
        .eq('title', title.trim())
        .maybeSingle();

      const journalData = {
        user_id: user.id,
        type: 'daily' as const,
        date: selectedDate,
        title: title.trim(),
        content,
      };

      console.log('Saving journal:', { 
        existingJournalId: existingJournal?.id, 
        currentJournalId: journalId,
        title: title.trim(), 
        date: selectedDate 
      });

      const { data, error } = existingJournal?.id
        ? await supabase
            .from('journals')
            .update(journalData)
            .eq('id', existingJournal.id)
            .select()
            .single()
        : await supabase
            .from('journals')
            .insert(journalData)
            .select()
            .single();

      console.log('Save result:', { data, error });

      if (error) {
        console.error('Save error:', error);
        setSavedMessage(`저장 중 오류가 발생했습니다: ${error.message}`);
        if (error.code === 'PGRST116') {
          setSavedMessage('제목을 입력해주세요.');
        } else if (error.code === '42501') {
          setSavedMessage('권한이 없습니다. 로그인 상태를 확인해주세요.');
        } else {
          setSavedMessage(`저장 중 오류가 발생했습니다: ${error.message} (코드: ${error.code || 'N/A'})`);
        }
      } else {
        setSavedMessage('회고가 성공적으로 저장되었습니다!');
        if (data) {
          setJournalId(data.id);
          if (data.title) {
            setTitle(data.title);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setSavedMessage(`예상치 못한 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMessage(''), 5000);
    }
  };

  const handleAIAnalysis = async () => {
    if (!journalId || !user) return;

    setLoadingAI(true);
    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setSavedMessage('로그인이 필요합니다.');
        setLoadingAI(false);
        return;
      }

      const response = await fetch(`/api/journals/${journalId}/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (response.status === 401) {
        setSavedMessage('로그인이 필요합니다.');
        return;
      }
      
      if (response.status === 402) {
        setSavedMessage('AI Pro 플랜이 필요합니다.');
        return;
      }
      
      if (response.status === 404) {
        setSavedMessage('회고를 찾을 수 없습니다.');
        return;
      }

      if (!response.ok) {
        setSavedMessage('AI 분석 중 오류가 발생했습니다.');
        return;
      }

      const result = await response.json();
      setAiAnalysis(result);
    } catch (error) {
      setSavedMessage('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <RetrospectLayout>
      {/* 상단: 날짜 선택 */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label htmlFor="journal-date" className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
              회고 작성일
            </label>
            <Input
              id="journal-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full max-w-xs text-base"
              max={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜 선택 불가
            />
          </div>
        </div>
      </div>

      {/* 템플릿 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>회고 템플릿 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={templateType === 'FREE' ? 'default' : 'outline'}
              onClick={() => setTemplateType('FREE')}
            >
              자유 작성
            </Button>
            <Button
              variant={templateType === 'KPT' ? 'default' : 'outline'}
              onClick={() => setTemplateType('KPT')}
            >
              KPT 템플릿
            </Button>
            <Button
              variant={templateType === 'PMI' ? 'default' : 'outline'}
              onClick={() => setTemplateType('PMI')}
            >
              PMI 템플릿
            </Button>
            <Button
              variant={templateType === '4L' ? 'default' : 'outline'}
              onClick={() => setTemplateType('4L')}
            >
              4L 템플릿
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {templateType === 'FREE' && (
              <p>
                <strong>자유 작성:</strong> 형식에 구애받지 않고 오늘의 경험과 생각을 자유롭게 기록합니다.
              </p>
            )}
            {templateType === 'KPT' && (
              <p>
                <strong>KPT 템플릿:</strong> Keep (계속할 것), Problem (문제점), Try (시도할 것)으로 구성된 회고 방식입니다.
              </p>
            )}
            {templateType === 'PMI' && (
              <p>
                <strong>PMI 템플릿:</strong> Plus (좋았던 것), Minus (아쉬웠던 것), Interesting (흥미로웠던 것)으로 구성된 회고 방식입니다.
              </p>
            )}
            {templateType === '4L' && (
              <p>
                <strong>4L 템플릿:</strong> Liked (좋았던 점), Learned (배운 점), Lacked (부족했던 점), Longed for (원했던 점)으로 구성된 회고 방식입니다.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 제목 입력 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>회고 제목</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="회고 제목을 입력하세요 (예: 오늘의 성장, 주간 회고 등)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full"
            maxLength={100}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            제목을 입력하면 회고를 더 쉽게 찾을 수 있습니다.
          </p>
        </CardContent>
      </Card>

      {/* 템플릿별 회고 작성 영역 */}
      {templateType === 'FREE' && (
        <FreeTemplate
          initialData={undefined}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {templateType === 'KPT' && (
        <KPTTemplate
          initialData={undefined}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {templateType === 'PMI' && (
        <PMITemplate
          initialData={undefined}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {templateType === '4L' && (
        <FourLTemplate
          initialData={undefined}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {/* 저장 메시지 */}
      {savedMessage && (
        <div className={`mt-4 p-4 rounded-lg ${
          savedMessage.includes('성공') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {savedMessage}
        </div>
      )}

      {/* AI 분석 버튼 및 결과 */}
      {journalId && (
        <div className="mt-6">
          {hasAIPlan ? (
            <div>
              <Button
                onClick={handleAIAnalysis}
                disabled={loadingAI}
                className="mb-4"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loadingAI ? 'AI 분석 중...' : 'AI 분석 보기'}
              </Button>

              {aiAnalysis && (
                <Card className="mt-4 bg-purple-50 dark:bg-gray-800 border-purple-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                      AI 분석 결과
                    </h3>
                    <div className="space-y-4">
                      {aiAnalysis.summary && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h4>
                          <p className="text-gray-700 dark:text-gray-300">{aiAnalysis.summary}</p>
                        </div>
                      )}
                      {aiAnalysis.keywords && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">키워드</h4>
                          <div className="flex flex-wrap gap-2">
                            {aiAnalysis.keywords.map((keyword: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {aiAnalysis.actions && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">내일 액션</h4>
                          <ul className="space-y-1">
                            {aiAnalysis.actions.map((action: string, index: number) => (
                              <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
                                <span className="mr-2">•</span>
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="bg-yellow-50 dark:bg-gray-800 border-yellow-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      AI 분석 기능을 사용하려면 AI Pro 플랜이 필요합니다
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      AI Pro 플랜으로 업그레이드하면 회고를 분석해 핵심 인사이트와 액션 아이템을 제공받을 수 있습니다.
                    </p>
                    <Link href="/pricing">
                      <Button variant="outline" size="sm">
                        AI Pro 플랜 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </RetrospectLayout>
  );
}

