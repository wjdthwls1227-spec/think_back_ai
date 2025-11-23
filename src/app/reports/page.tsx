'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import type { DailyAnalysisResult, WeeklyAnalysisResult, MonthlyAnalysisResult } from '@/types';
import { supabase } from '@/lib/supabase';
import { Calendar, TrendingUp, Lightbulb, Target, FileText, Sparkles, MessageSquare, Send, Save, Check, Trash2 } from 'lucide-react';
import { RetrospectLayout } from '@/components/retrospect/RetrospectLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <RetrospectLayout>
        <ReportsContent />
      </RetrospectLayout>
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { user, isAdmin } = useAuth();
  const [hasAIPlan, setHasAIPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'saved'>('daily');
  
  // 일간 분석
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dailyAnalysis, setDailyAnalysis] = useState<DailyAnalysisResult | null>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);
  
  // 주간 분석
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>('');
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<WeeklyAnalysisResult | null>(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  
  // 월간 분석
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlyAnalysis, setMonthlyAnalysis] = useState<MonthlyAnalysisResult | null>(null);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // AI 질문
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatContext, setChatContext] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  
  // 리포트 저장 상태
  const [savingDaily, setSavingDaily] = useState(false);
  const [savedDaily, setSavedDaily] = useState(false);
  const [savingWeekly, setSavingWeekly] = useState(false);
  const [savedWeekly, setSavedWeekly] = useState(false);
  const [savingMonthly, setSavingMonthly] = useState(false);
  const [savedMonthly, setSavedMonthly] = useState(false);
  
  // 저장된 리포트 목록
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loadingSavedReports, setLoadingSavedReports] = useState(false);
  const [selectedSavedReportId, setSelectedSavedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkAIPlan();
      initializeDates();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedPeriod === 'saved') {
      loadSavedReports();
    }
  }, [user, selectedPeriod]);

  const loadSavedReports = async () => {
    if (!user) return;
    
    setLoadingSavedReports(true);
    try {
      const { data: reports, error } = await supabase
        .from('report_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading saved reports:', error);
        return;
      }

      setSavedReports(reports || []);
    } catch (error) {
      console.error('Error loading saved reports:', error);
    } finally {
      setLoadingSavedReports(false);
    }
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    
    if (!confirm('정말 이 리포트를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch('/api/reports/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ reportId }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to delete report:', result);
        alert(result.error || '리포트 삭제 중 오류가 발생했습니다.');
        return;
      }

      // 삭제된 리포트가 선택된 리포트면 선택 해제
      if (selectedSavedReportId === reportId) {
        setSelectedSavedReportId(null);
      }

      // 목록 새로고침
      await loadSavedReports();
      
      alert('리포트가 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('리포트 삭제 중 오류가 발생했습니다.');
    }
  };

  const checkAIPlan = async () => {
    if (!user) return;
    
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
    setLoading(false);
  };

  const initializeDates = () => {
    const today = new Date();
    // 로컬 타임존 기준으로 오늘 날짜 생성 (YYYY-MM-DD)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    setSelectedDate(todayStr);
    const weekStart = getWeekStart(todayStr);
    setSelectedWeekStart(weekStart);
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  const getWeekStart = (date: string): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const weekStart = new Date(d.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  const handleDailyAnalysis = async () => {
    if (!selectedDate || !hasAIPlan) return;
    
    setLoadingDaily(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token || !user) {
        alert('로그인이 필요합니다.');
        setLoadingDaily(false);
        return;
      }

      const userInfo = {
        id: user.id,
        email: user.email,
        isAdmin,
      };
      
      // 먼저 해당 날짜의 회고를 클라이언트에서 조회하여 서버로 전달
      const { data: clientJournals, error: clientJournalsError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', selectedDate)
        .order('created_at', { ascending: true });
      
      // 날짜 형식이 다를 수 있으므로 문자열 비교로도 시도
      let matchingJournals = clientJournals || [];
      if (!matchingJournals || matchingJournals.length === 0) {
        const { data: allRecentJournals } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
        
        matchingJournals = allRecentJournals?.filter(j => {
          const journalDate = String(j.date).split('T')[0];
          return journalDate === selectedDate;
        }) || [];
      }
      
      console.log('Client-side journal fetch:', {
        selectedDate,
        clientJournalsCount: clientJournals?.length || 0,
        matchingJournalsCount: matchingJournals.length,
        matchingIds: matchingJournals.map(j => j.id),
      });
      
      const response = await fetch('/api/journals/daily/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          date: selectedDate,
          userInfo,
          journalsData: matchingJournals.length > 0 ? matchingJournals : undefined, // 클라이언트에서 찾은 회고 데이터 전달
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI Pro plan required:', errorData);
        alert(`AI Pro 플랜이 필요합니다.\n\n상세 정보:\n- 어드민: ${errorData.details?.isAdmin ? '예' : '아니오'}\n- AI 플랜: ${errorData.details?.hasAIPlan ? '예' : '아니오'}\n- 만료일: ${errorData.details?.ai_plan_until || '없음'}`);
        return;
      }

      const result = await response.json();
      
      if (result.error === 'No journals found for this date') {
        // 실제 저장된 회고 날짜 확인
        const { data: recentJournals } = await supabase
          .from('journals')
          .select('id, date, title, type')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
        
        const recentDates = recentJournals?.map(j => j.date) || [];
        const uniqueDates = [...new Set(recentDates)].sort().reverse();
        
        // 선택한 날짜의 회고 찾기 (문자열 변환하여 비교)
        const matchingJournals = recentJournals?.filter(j => {
          const journalDate = String(j.date).split('T')[0]; // 날짜 부분만 추출
          return journalDate === selectedDate || String(j.date) === selectedDate;
        }) || [];
        
        console.error('No journals found:', {
          selectedDate,
          result,
          recentJournals: recentJournals?.map(j => ({ 
            id: j.id, 
            date: j.date, 
            dateString: String(j.date),
            dateOnly: String(j.date).split('T')[0],
            matches: String(j.date).split('T')[0] === selectedDate || String(j.date) === selectedDate
          })) || [],
          uniqueDates,
          matchingJournals: matchingJournals.map(j => ({ 
            id: j.id, 
            date: j.date, 
            dateString: String(j.date) 
          })),
        });
        
        // 클라이언트에서 찾은 회고가 있으면 전체 데이터를 서버로 전달
        console.log('Checking if retry is needed:', {
          matchingJournalsCount: matchingJournals.length,
          shouldRetry: matchingJournals.length > 0,
        });
        
        if (matchingJournals.length > 0) {
          console.log('✅ Found journals on client, fetching full data and sending to server', {
            matchingCount: matchingJournals.length,
            matchingIds: matchingJournals.map(j => j.id),
          });
          
          // 전체 회고 데이터 조회
          const { data: fullJournals, error: fullError } = await supabase
            .from('journals')
            .select('*')
            .in('id', matchingJournals.map(j => j.id))
            .order('created_at', { ascending: true });
          
          if (fullError || !fullJournals || fullJournals.length === 0) {
            console.error('Failed to fetch full journal data:', fullError);
            alert('회고 데이터를 불러오는 중 오류가 발생했습니다.');
            return;
          }
          
          console.log('Sending journals data to server:', {
            count: fullJournals.length,
            ids: fullJournals.map(j => j.id),
          });
          
          // 회고 데이터를 서버로 전달하여 분석 요청
          console.log('Sending retry request with journalsData:', {
            date: selectedDate,
            journalsDataCount: fullJournals.length,
            journalsDataIds: fullJournals.map(j => j.id),
            journalsDataDates: fullJournals.map(j => ({ id: j.id, date: j.date, dateString: String(j.date) })),
          });
          
          const retryResponse = await fetch('/api/journals/daily/analyze', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ 
              date: selectedDate,
              userInfo,
              journalsData: fullJournals, // 클라이언트에서 조회한 전체 회고 데이터 전달
            }),
          });
          
          const retryResult = await retryResponse.json();
          
          console.log('Retry response:', {
            ok: retryResponse.ok,
            status: retryResponse.status,
            hasError: !!retryResult.error,
            error: retryResult.error,
            hasSummary: !!retryResult.summary,
            summary: retryResult.summary?.substring(0, 100),
            fullResult: retryResult,
          });
          
          // 성공한 경우 (에러가 없고 분석 결과가 있는 경우)
          if (retryResponse.ok && !retryResult.error && retryResult.summary) {
            console.log('Retry successful, setting analysis result');
            setDailyAnalysis(retryResult);
            setChatContext('daily');
            setChatMessages([]);
            setSavedDaily(false);
            
            // 자동 저장
            await saveDailyReport(retryResult, selectedDate);
            return;
          }
          
          // 여전히 회고를 찾지 못한 경우
          if (retryResult.error === 'No journals found for this date') {
            console.warn('Still no journals found after retry with full data:', retryResult);
            alert('서버에서 회고를 분석하는 중 오류가 발생했습니다.');
            // 아래 로직으로 계속 진행 (날짜 변경 또는 알림)
          } else if (retryResult.error) {
            // 다른 에러인 경우
            console.error('Retry failed with error:', retryResult);
            
            // OpenAI 할당량 초과 에러인 경우 특별 처리
            if (retryResult.details && retryResult.details.includes('429')) {
              alert('OpenAI API 할당량이 초과되었습니다.\n\n해결 방법:\n1. OpenAI 대시보드(https://platform.openai.com/account/usage)에서 할당량 확인\n2. 크레딧이 부족하면 충전 필요\n3. 충전 후 다시 시도해주세요.');
            } else {
              alert(retryResult.error || '분석 중 오류가 발생했습니다.');
            }
            return;
          }
        }
        
        if (uniqueDates.length > 0) {
          // 가장 최근 날짜로 자동 설정
          const mostRecentDate = uniqueDates[0];
          setSelectedDate(mostRecentDate);
          
          alert(`해당 날짜에 작성된 회고가 없습니다.\n\n선택한 날짜: ${selectedDate}\n\n최근 작성된 회고 날짜:\n${uniqueDates.slice(0, 5).join('\n')}\n\n가장 최근 날짜(${mostRecentDate})로 자동 변경했습니다. 다시 분석을 실행해주세요.`);
        } else {
          alert(`해당 날짜에 작성된 회고가 없습니다.\n\n선택한 날짜: ${selectedDate}\n\n회고를 먼저 작성해주세요.`);
        }
        return;
      }

      if (!response.ok) {
        console.error('Analysis failed:', result);
        alert(result.error || '분석 중 오류가 발생했습니다.');
        return;
      }

      setDailyAnalysis(result);
      setChatContext('daily');
      setChatMessages([]);
      setSavedDaily(false); // 새로운 분석 결과이므로 저장 상태 초기화
      
      // 자동 저장
      await saveDailyReport(result, selectedDate);
    } catch (error) {
      console.error('Error analyzing daily:', error);
      alert('일간 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingDaily(false);
    }
  };

  const saveDailyReport = async (analysisResult: DailyAnalysisResult, date: string) => {
    if (!analysisResult || !date || !user) {
      console.warn('saveDailyReport: Missing parameters', { analysisResult: !!analysisResult, date, user: !!user });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn('saveDailyReport: No token');
        return;
      }

      // 해당 날짜의 회고 ID 조회
      const { data: journals, error: journalsError } = await supabase
        .from('journals')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', date);

      if (journalsError) {
        console.error('Error fetching journals for save:', journalsError);
      }

      const journalIds = journals?.map(j => j.id) || [];

      console.log('Auto-saving daily report:', { date, journalCount: journalIds.length });

      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType: 'daily',
          periodStart: date,
          periodEnd: date,
          analysisResult,
          journalIds,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Failed to parse response JSON:', e);
        result = { error: 'Failed to parse server response' };
      }

      if (response.ok) {
        console.log('Daily report auto-saved successfully:', result);
        setSavedDaily(true);
        setTimeout(() => setSavedDaily(false), 3000);
      } else {
        console.error('Failed to auto-save daily report:', {
          status: response.status,
          statusText: response.statusText,
          result,
          error: result.error,
          details: result.details,
          code: result.code,
          hint: result.hint,
        });
      }
    } catch (error) {
      console.error('Error auto-saving daily report:', error);
    }
  };

  const handleSaveDailyReport = async () => {
    if (!dailyAnalysis || !selectedDate) return;
    await saveDailyReport(dailyAnalysis, selectedDate);
  };

  const handleWeeklyAnalysis = async () => {
    if (!selectedWeekStart || !hasAIPlan) return;
    
    setLoadingWeekly(true);
    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token || !user) {
        alert('로그인이 필요합니다.');
        setLoadingWeekly(false);
        return;
      }

      // 사용자 정보 전달 (서버에서 프로필 조회 실패 시 대비)
      const userInfo = {
        id: user.id,
        email: user.email,
        isAdmin, // 클라이언트에서 확인한 어드민 상태
      };
      
      // 주간 시작일과 종료일 계산 (로컬 타임존 기준)
      const weekStartDate = new Date(selectedWeekStart + 'T00:00:00');
      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // YYYY-MM-DD 형식으로 변환
      const weekStartStr = selectedWeekStart; // 이미 YYYY-MM-DD 형식
      const weekEndYear = weekEnd.getFullYear();
      const weekEndMonth = String(weekEnd.getMonth() + 1).padStart(2, '0');
      const weekEndDay = String(weekEnd.getDate()).padStart(2, '0');
      const weekEndStr = `${weekEndYear}-${weekEndMonth}-${weekEndDay}`;
      
      // 클라이언트에서 해당 주간의 회고를 먼저 조회
      const { data: clientJournals, error: clientJournalsError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true });
      
      // 날짜 형식이 다를 수 있으므로 문자열 비교로도 시도
      let matchingJournals = clientJournals || [];
      if (!matchingJournals || matchingJournals.length === 0) {
        const { data: allRecentJournals } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(20);
        
        matchingJournals = allRecentJournals?.filter(j => {
          const journalDate = String(j.date).split('T')[0];
          return journalDate >= weekStartStr && journalDate <= weekEndStr;
        }) || [];
      }
      
      console.log('Client-side weekly journal fetch:', {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        clientJournalsCount: clientJournals?.length || 0,
        matchingJournalsCount: matchingJournals.length,
        matchingIds: matchingJournals.map(j => j.id),
      });
      
      const response = await fetch('/api/journals/weekly/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          weekStart: selectedWeekStart,
          userInfo,
          journalsData: matchingJournals.length > 0 ? matchingJournals : undefined, // 클라이언트에서 찾은 회고 데이터 전달
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI Pro plan required:', errorData);
        alert(`AI Pro 플랜이 필요합니다.\n\n상세 정보:\n- 어드민: ${errorData.details?.isAdmin ? '예' : '아니오'}\n- AI 플랜: ${errorData.details?.hasAIPlan ? '예' : '아니오'}\n- 만료일: ${errorData.details?.ai_plan_until || '없음'}`);
        return;
      }

      const result = await response.json();
      
      if (result.error === 'No journals found for this week') {
        alert(`해당 주에 작성된 회고가 없습니다.\n\n선택한 주: ${selectedWeekStart}\n\n회고를 먼저 작성해주세요.`);
        return;
      }

      if (!response.ok) {
        console.error('Analysis failed:', result);
        alert(result.error || '분석 중 오류가 발생했습니다.');
        return;
      }

      setWeeklyAnalysis(result);
      setChatContext('weekly');
      setChatMessages([]);
      setSavedWeekly(false); // 새로운 분석 결과이므로 저장 상태 초기화
      
      // 자동 저장
      if (selectedWeekStart) {
        await saveWeeklyReport(result, selectedWeekStart);
      }
    } catch (error) {
      console.error('Error analyzing weekly:', error);
      alert('주간 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingWeekly(false);
    }
  };

  const saveWeeklyReport = async (analysisResult: WeeklyAnalysisResult, weekStart: string) => {
    if (!analysisResult || !weekStart || !user) {
      console.warn('saveWeeklyReport: Missing parameters', { analysisResult: !!analysisResult, weekStart, user: !!user });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn('saveWeeklyReport: No token');
        return;
      }

      // 주간 시작일과 종료일 계산 (로컬 타임존 기준)
      const weekStartDate = new Date(weekStart + 'T00:00:00');
      const weekEnd = new Date(weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      // YYYY-MM-DD 형식으로 변환
      const weekStartStr = weekStart; // 이미 YYYY-MM-DD 형식
      const weekEndYear = weekEnd.getFullYear();
      const weekEndMonth = String(weekEnd.getMonth() + 1).padStart(2, '0');
      const weekEndDay = String(weekEnd.getDate()).padStart(2, '0');
      const weekEndStr = `${weekEndYear}-${weekEndMonth}-${weekEndDay}`;

      // 해당 주간의 회고 ID 조회
      const { data: journals, error: journalsError } = await supabase
        .from('journals')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr);

      if (journalsError) {
        console.error('Error fetching journals for save:', journalsError);
      }

      const journalIds = journals?.map(j => j.id) || [];

      console.log('Auto-saving weekly report:', { weekStart, weekEnd: weekEnd.toISOString().split('T')[0], journalCount: journalIds.length });

      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType: 'weekly',
          periodStart: weekStartStr,
          periodEnd: weekEndStr,
          analysisResult,
          journalIds,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log('Weekly report auto-saved successfully');
        setSavedWeekly(true);
        setTimeout(() => setSavedWeekly(false), 3000);
      } else {
        console.error('Failed to auto-save weekly report:', result);
      }
    } catch (error) {
      console.error('Error auto-saving weekly report:', error);
    }
  };

  const handleSaveWeeklyReport = async () => {
    if (!weeklyAnalysis || !selectedWeekStart) return;
    await saveWeeklyReport(weeklyAnalysis, selectedWeekStart);
  };

  const handleMonthlyAnalysis = async () => {
    if (!hasAIPlan) return;
    
    setLoadingMonthly(true);
    try {
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token || !user) {
        alert('로그인이 필요합니다.');
        setLoadingMonthly(false);
        return;
      }

      // 사용자 정보 전달 (서버에서 프로필 조회 실패 시 대비)
      const userInfo = {
        id: user.id,
        email: user.email,
        isAdmin, // 클라이언트에서 확인한 어드민 상태
      };

      // 월간 시작일과 종료일 계산
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);
      
      // YYYY-MM-DD 형식으로 변환
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const monthEndStr = monthEnd.toISOString().split('T')[0];
      
      // 클라이언트에서 해당 월의 회고를 먼저 조회
      const { data: clientJournals, error: clientJournalsError } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStartStr)
        .lte('date', monthEndStr)
        .order('date', { ascending: true });
      
      // 날짜 형식이 다를 수 있으므로 문자열 비교로도 시도
      let matchingJournals = clientJournals || [];
      if (!matchingJournals || matchingJournals.length === 0) {
        const { data: allRecentJournals } = await supabase
          .from('journals')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(50);
        
        matchingJournals = allRecentJournals?.filter(j => {
          const journalDate = String(j.date).split('T')[0];
          return journalDate >= monthStartStr && journalDate <= monthEndStr;
        }) || [];
      }
      
      console.log('Client-side monthly journal fetch:', {
        monthStart: monthStartStr,
        monthEnd: monthEndStr,
        clientJournalsCount: clientJournals?.length || 0,
        matchingJournalsCount: matchingJournals.length,
        matchingIds: matchingJournals.map(j => j.id),
      });

      const response = await fetch('/api/journals/monthly/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ 
          year: selectedYear, 
          month: selectedMonth,
          userInfo,
          journalsData: matchingJournals.length > 0 ? matchingJournals : undefined, // 클라이언트에서 찾은 회고 데이터 전달
        }),
      });

      if (response.status === 402) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI Pro plan required:', errorData);
        alert(`AI Pro 플랜이 필요합니다.\n\n상세 정보:\n- 어드민: ${errorData.details?.isAdmin ? '예' : '아니오'}\n- AI 플랜: ${errorData.details?.hasAIPlan ? '예' : '아니오'}\n- 만료일: ${errorData.details?.ai_plan_until || '없음'}`);
        return;
      }

      const result = await response.json();
      
      if (result.error === 'No journals found for this month') {
        alert(`해당 월에 작성된 회고가 없습니다.\n\n선택한 월: ${selectedYear}년 ${selectedMonth}월\n\n회고를 먼저 작성해주세요.`);
        return;
      }

      if (!response.ok) {
        console.error('Analysis failed:', result);
        alert(result.error || '분석 중 오류가 발생했습니다.');
        return;
      }

      setMonthlyAnalysis(result);
      setChatContext('monthly');
      setChatMessages([]);
      setSavedMonthly(false); // 새로운 분석 결과이므로 저장 상태 초기화
      
      // 자동 저장
      await saveMonthlyReport(result);
    } catch (error) {
      console.error('Error analyzing monthly:', error);
      alert('월간 분석 중 오류가 발생했습니다.');
    } finally {
      setLoadingMonthly(false);
    }
  };

  const saveMonthlyReport = async (analysisResult: MonthlyAnalysisResult) => {
    if (!analysisResult || !user) {
      console.warn('saveMonthlyReport: Missing parameters', { analysisResult: !!analysisResult, user: !!user });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.warn('saveMonthlyReport: No token');
        return;
      }

      // 월간 시작일과 종료일 계산
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);

      // 해당 월의 회고 ID 조회
      const { data: journals, error: journalsError } = await supabase
        .from('journals')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', monthStart.toISOString().split('T')[0])
        .lte('date', monthEnd.toISOString().split('T')[0]);

      if (journalsError) {
        console.error('Error fetching journals for save:', journalsError);
      }

      const journalIds = journals?.map(j => j.id) || [];

      console.log('Auto-saving monthly report:', { 
        year: selectedYear, 
        month: selectedMonth,
        periodStart: monthStart.toISOString().split('T')[0],
        periodEnd: monthEnd.toISOString().split('T')[0],
        journalCount: journalIds.length 
      });

      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType: 'monthly',
          periodStart: monthStart.toISOString().split('T')[0],
          periodEnd: monthEnd.toISOString().split('T')[0],
          analysisResult,
          journalIds,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log('Monthly report auto-saved successfully');
        setSavedMonthly(true);
        setTimeout(() => setSavedMonthly(false), 3000);
      } else {
        console.error('Failed to auto-save monthly report:', result);
      }
    } catch (error) {
      console.error('Error auto-saving monthly report:', error);
    }
  };

  const handleSaveMonthlyReport = async () => {
    if (!monthlyAnalysis) return;
    await saveMonthlyReport(monthlyAnalysis);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatContext || !hasAIPlan) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoadingChat(true);

    try {
      const contextData = chatContext === 'daily' 
        ? dailyAnalysis 
        : chatContext === 'weekly' 
        ? weeklyAnalysis 
        : monthlyAnalysis;
      
      // 세션 토큰 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        alert('로그인이 필요합니다.');
        setLoadingChat(false);
        return;
      }

      // userInfo 객체 생성 (어드민 체크를 위해)
      const userInfo = {
        id: user?.id,
        email: user?.email,
        isAdmin: isAdmin || false,
      };

      const response = await fetch('/api/journals/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          question: userMessage,
          context: contextData,
          period: chatContext,
          userInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('질문 처리 실패');
      }

      const result = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.answer }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '죄송합니다. 질문을 처리하는 중 오류가 발생했습니다.' 
      }]);
    } finally {
      setLoadingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!hasAIPlan) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card>
          <CardHeader className="text-center">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-gray-900 dark:text-white">AI Pro 플랜이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-gray-600 dark:text-gray-400">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              리포트 기능을 사용하려면 AI Pro 플랜이 필요합니다.
            </p>
            <p>
              주간/월간 리포트와 AI 질문 기능을 이용하실 수 있습니다.
            </p>
            <div className="pt-4">
              <Button onClick={() => (window.location.href = '/pricing')}>
                요금제 확인하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          리포트
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI 분석을 통한 일간/주간/월간 회고 리포트와 AI 질문 기능을 이용하세요.
        </p>
      </div>

      <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as 'daily' | 'weekly' | 'monthly' | 'saved')}>
        <TabsList className="mb-6">
          <TabsTrigger value="daily">일간 리포트</TabsTrigger>
          <TabsTrigger value="weekly">주간 리포트</TabsTrigger>
          <TabsTrigger value="monthly">월간 리포트</TabsTrigger>
          <TabsTrigger value="saved">저장된 리포트</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>일간 분석 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  날짜
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <Button onClick={handleDailyAnalysis} disabled={loadingDaily || !selectedDate}>
                <Sparkles className="w-4 h-4 mr-2" />
                {loadingDaily ? '분석 중...' : '일간 분석 실행'}
              </Button>
            </CardContent>
          </Card>

          {dailyAnalysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      일간 분석 결과
                    </CardTitle>
                    <Button 
                      onClick={handleSaveDailyReport} 
                      disabled={savingDaily || savedDaily}
                      variant={savedDaily ? "outline" : "default"}
                      size="sm"
                    >
                      {savedDaily ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {savingDaily ? '저장 중...' : '저장하기'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h3>
                    <p className="text-gray-700 dark:text-gray-300">{dailyAnalysis.summary}</p>
                  </div>
                  
                  {dailyAnalysis.keywords && dailyAnalysis.keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {dailyAnalysis.keywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyAnalysis.highlights && dailyAnalysis.highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        하이라이트
                      </h3>
                      <ul className="space-y-2">
                        {dailyAnalysis.highlights.map((highlight: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                              <span className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">★</span>
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dailyAnalysis.emotions && dailyAnalysis.emotions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">주요 감정</h3>
                      <div className="flex flex-wrap gap-2">
                        {dailyAnalysis.emotions.map((emotion: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded text-sm">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dailyAnalysis.learnings && dailyAnalysis.learnings.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        배운 점
                      </h3>
                      <ul className="space-y-2">
                        {dailyAnalysis.learnings.map((learning: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                              <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">{i + 1}</span>
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{learning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dailyAnalysis.tomorrowFocus && dailyAnalysis.tomorrowFocus.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">내일 집중할 점</h3>
                      <ul className="space-y-2">
                        {dailyAnalysis.tomorrowFocus.map((focus: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">• {focus}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>주간 분석 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  주 시작일
                </label>
                <Input
                  type="date"
                  value={selectedWeekStart}
                  onChange={(e) => setSelectedWeekStart(e.target.value)}
                />
              </div>
              <Button onClick={handleWeeklyAnalysis} disabled={loadingWeekly || !selectedWeekStart}>
                <Sparkles className="w-4 h-4 mr-2" />
                {loadingWeekly ? '분석 중...' : '주간 분석 실행'}
              </Button>
            </CardContent>
          </Card>

          {weeklyAnalysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      주간 분석 결과
                    </CardTitle>
                    <Button 
                      onClick={handleSaveWeeklyReport} 
                      disabled={savingWeekly || savedWeekly}
                      variant={savedWeekly ? "outline" : "default"}
                      size="sm"
                    >
                      {savedWeekly ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {savingWeekly ? '저장 중...' : '저장하기'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h3>
                    <p className="text-gray-700 dark:text-gray-300">{weeklyAnalysis.summary}</p>
                  </div>
                  
                  {weeklyAnalysis.keywords && weeklyAnalysis.keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {weeklyAnalysis.keywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {weeklyAnalysis.patterns && weeklyAnalysis.patterns.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        패턴
                      </h3>
                      <ul className="space-y-2">
                        {weeklyAnalysis.patterns.map((pattern: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{pattern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weeklyAnalysis.improvements && weeklyAnalysis.improvements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <Target className="w-4 h-4 mr-2" />
                        개선점
                      </h3>
                      <ul className="space-y-2">
                        {weeklyAnalysis.improvements.map((improvement: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                              <span className="text-green-600 dark:text-green-400 text-xs font-semibold">{i + 1}</span>
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {weeklyAnalysis.nextWeekGoals && weeklyAnalysis.nextWeekGoals.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">다음 주 목표</h3>
                      <ul className="space-y-2">
                        {weeklyAnalysis.nextWeekGoals.map((goal: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">• {goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>월간 분석 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    연도
                  </label>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min={2020}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    월
                  </label>
                  <Input
                    type="number"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    min={1}
                    max={12}
                  />
                </div>
              </div>
              <Button onClick={handleMonthlyAnalysis} disabled={loadingMonthly}>
                <Sparkles className="w-4 h-4 mr-2" />
                {loadingMonthly ? '분석 중...' : '월간 분석 실행'}
              </Button>
            </CardContent>
          </Card>

          {monthlyAnalysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      월간 분석 결과
                    </CardTitle>
                    <Button 
                      onClick={handleSaveMonthlyReport} 
                      disabled={savingMonthly || savedMonthly}
                      variant={savedMonthly ? "outline" : "default"}
                      size="sm"
                    >
                      {savedMonthly ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {savingMonthly ? '저장 중...' : '저장하기'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h3>
                    <p className="text-gray-700 dark:text-gray-300">{monthlyAnalysis.summary}</p>
                  </div>
                  
                  {monthlyAnalysis.keywords && monthlyAnalysis.keywords.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {monthlyAnalysis.keywords.map((keyword: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {monthlyAnalysis.longTermPatterns && monthlyAnalysis.longTermPatterns.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">장기 패턴</h3>
                      <ul className="space-y-2">
                        {monthlyAnalysis.longTermPatterns.map((pattern: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">• {pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {monthlyAnalysis.achievements && monthlyAnalysis.achievements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">주요 성과</h3>
                      <ul className="space-y-2">
                        {monthlyAnalysis.achievements.map((achievement: string, i: number) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300">• {achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>저장된 리포트</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSavedReports ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
                </div>
              ) : savedReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  저장된 리포트가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedReports.map((report) => {
                    const isSelected = selectedSavedReportId === report.id;
                    return (
                      <div key={report.id}>
                        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setSelectedSavedReportId(isSelected ? null : report.id)}>
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {report.report_type === 'daily' && '일간 리포트'}
                                  {report.report_type === 'weekly' && '주간 리포트'}
                                  {report.report_type === 'monthly' && '월간 리포트'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {report.report_type === 'daily' && `${report.period_start}`}
                                  {report.report_type === 'weekly' && `${report.period_start} ~ ${report.period_end}`}
                                  {report.report_type === 'monthly' && `${report.period_start} ~ ${report.period_end}`}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {new Date(report.created_at).toLocaleString('ko-KR')}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDeleteReport(report.id, e)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {isSelected && (
                          <Card className="mt-4">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center">
                                  <Calendar className="w-5 h-5 mr-2" />
                                  {report.report_type === 'daily' && '일간 리포트'}
                                  {report.report_type === 'weekly' && '주간 리포트'}
                                  {report.report_type === 'monthly' && '월간 리포트'}
                                </CardTitle>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleDeleteReport(report.id, e)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    삭제
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedSavedReportId(null)}>
                                    닫기
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>기간: {report.period_start} {report.period_end && `~ ${report.period_end}`}</p>
                                <p>저장일: {new Date(report.created_at).toLocaleString('ko-KR')}</p>
                              </div>
                              
                              {report.analysis_result && (
                                <>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h3>
                                    <p className="text-gray-700 dark:text-gray-300">{report.analysis_result.summary}</p>
                                  </div>
                                  
                                  {report.analysis_result.keywords && report.analysis_result.keywords.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">키워드</h3>
                                      <div className="flex flex-wrap gap-2">
                                        {report.analysis_result.keywords.map((keyword: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                                            {keyword}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {report.analysis_result.highlights && report.analysis_result.highlights.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Lightbulb className="w-4 h-4 mr-2" />
                                        하이라이트
                                      </h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.highlights.map((highlight: string, i: number) => (
                                          <li key={i} className="flex items-start">
                                            <span className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                              <span className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">★</span>
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{highlight}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.learnings && report.analysis_result.learnings.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        배운 점
                                      </h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.learnings.map((learning: string, i: number) => (
                                          <li key={i} className="flex items-start">
                                            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                              <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">{i + 1}</span>
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{learning}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.patterns && report.analysis_result.patterns.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <TrendingUp className="w-4 h-4 mr-2" />
                                        패턴
                                      </h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.patterns.map((pattern: string, i: number) => (
                                          <li key={i} className="flex items-start">
                                            <Lightbulb className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" />
                                            <span className="text-gray-700 dark:text-gray-300">{pattern}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.improvements && report.analysis_result.improvements.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        개선점
                                      </h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.improvements.map((improvement: string, i: number) => (
                                          <li key={i} className="flex items-start">
                                            <span className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2 mt-0.5">
                                              <span className="text-green-600 dark:text-green-400 text-xs font-semibold">{i + 1}</span>
                                            </span>
                                            <span className="text-gray-700 dark:text-gray-300">{improvement}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.achievements && report.analysis_result.achievements.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">주요 성과</h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.achievements.map((achievement: string, i: number) => (
                                          <li key={i} className="text-gray-700 dark:text-gray-300">• {achievement}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.longTermPatterns && report.analysis_result.longTermPatterns.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">장기 패턴</h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.longTermPatterns.map((pattern: string, i: number) => (
                                          <li key={i} className="text-gray-700 dark:text-gray-300">• {pattern}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.tomorrowFocus && report.analysis_result.tomorrowFocus.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">내일 집중할 점</h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.tomorrowFocus.map((focus: string, i: number) => (
                                          <li key={i} className="text-gray-700 dark:text-gray-300">• {focus}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {report.analysis_result.nextWeekGoals && report.analysis_result.nextWeekGoals.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">다음 주 목표</h3>
                                      <ul className="space-y-2">
                                        {report.analysis_result.nextWeekGoals.map((goal: string, i: number) => (
                                          <li key={i} className="text-gray-700 dark:text-gray-300">• {goal}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </>
                                  )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI 질문 섹션 */}
      {(dailyAnalysis || weeklyAnalysis || monthlyAnalysis) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              AI 질문하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 max-h-96 overflow-y-auto space-y-4">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    리포트에 대해 궁금한 것을 질문해보세요.
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {loadingChat && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="리포트에 대해 질문하세요..."
                  disabled={loadingChat}
                />
                <Button type="submit" disabled={loadingChat || !chatInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
