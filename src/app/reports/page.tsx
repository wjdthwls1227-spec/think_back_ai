'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate, getWeekRange } from '@/lib/utils';
import { RetrospectiveEntry, WeeklyReport, KPTContent, PMIContent, FreeContent } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, TrendingUp, Lightbulb, Target, FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

function ReportsContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RetrospectiveEntry[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('retrospective_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        const entries = data || [];
        setEntries(entries);
        generateWeeklyReports(entries);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyReports = (entries: RetrospectiveEntry[]) => {
    const weeklyGroups: { [key: string]: RetrospectiveEntry[] } = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekRange = getWeekRange(entryDate);
      const weekKey = `${weekRange.start.toISOString().split('T')[0]}_${weekRange.end.toISOString().split('T')[0]}`;
      
      if (!weeklyGroups[weekKey]) {
        weeklyGroups[weekKey] = [];
      }
      weeklyGroups[weekKey].push(entry);
    });

    const reports: WeeklyReport[] = Object.entries(weeklyGroups).map(([weekKey, weekEntries]) => {
      const [startStr, endStr] = weekKey.split('_');
      const analysis = generateAIAnalysis(weekEntries);
      
      return {
        id: crypto.randomUUID(),
        weekStart: startStr,
        weekEnd: endStr,
        entries: weekEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        aiAnalysis: analysis.summary,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        createdAt: new Date().toISOString(),
      };
    });

    const sortedReports = reports.sort((a, b) => 
      new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );

    setWeeklyReports(sortedReports);
    if (sortedReports.length > 0 && !selectedWeek) {
      setSelectedWeek(sortedReports[0].id);
    }
  };

  const generateAIAnalysis = (entries: RetrospectiveEntry[]) => {
    const kptEntries = entries.filter(e => e.type === 'KPT');
    const pmiEntries = entries.filter(e => e.type === 'PMI');
    const freeEntries = entries.filter(e => e.type === 'FREE');
    
    const allKeeps: string[] = [];
    const allProblems: string[] = [];
    const allTries: string[] = [];
    const allPlus: string[] = [];
    const allMinus: string[] = [];
    const allInteresting: string[] = [];
    const freeHighlights: string[] = [];

    kptEntries.forEach(entry => {
      const content = entry.content as KPTContent;
      allKeeps.push(...content.keep);
      allProblems.push(...content.problem);
      allTries.push(...content.try);
    });

    pmiEntries.forEach(entry => {
      const content = entry.content as PMIContent;
      allPlus.push(...content.plus);
      allMinus.push(...content.minus);
      allInteresting.push(...content.interesting);
    });

    freeEntries.forEach(entry => {
      const content = entry.content as FreeContent;
      if (content.text) {
        freeHighlights.push(content.text);
      }
    });

    const insights = [];
    const recommendations = [];

    if (allKeeps.length > 0 || allPlus.length > 0) {
      insights.push('이번 주에는 긍정적인 성과와 유지해야 할 좋은 습관들이 많이 관찰되었습니다.');
    }

    if (allProblems.length > 0 || allMinus.length > 0) {
      insights.push('개선이 필요한 영역들이 식별되었으며, 이를 해결하기 위한 구체적인 계획이 필요합니다.');
      recommendations.push('문제점들을 우선순위별로 정리하고 단계적 해결 방안을 마련하세요.');
    }

    if (allTries.length > 0) {
      recommendations.push('새로운 시도사항들을 실행하고 그 결과를 다음 회고에서 평가해보세요.');
    }

    if (allInteresting.length > 0) {
      insights.push('새로운 학습과 흥미로운 발견들이 있어 성장의 기회를 만들고 있습니다.');
      recommendations.push('흥미로운 영역들을 더 깊이 탐구해보는 것을 고려해보세요.');
    }

    if (freeHighlights.length > 0) {
      insights.push('자유 작성 회고에서 감정과 생각이 풍부하게 기록되었습니다. 이를 기반으로 추가적인 인사이트를 도출해보세요.');
    }

    if (insights.length === 0) {
      insights.push('이번 주 회고 데이터를 기반으로 한 분석 결과입니다.');
    }

    if (recommendations.length === 0) {
      recommendations.push('꾸준한 회고 작성을 통해 더 정확한 분석과 추천을 제공할 수 있습니다.');
    }

    const summary = `총 ${entries.length}개의 회고가 작성되었습니다. (KPT: ${kptEntries.length}개, PMI: ${pmiEntries.length}개, 자유 작성: ${freeEntries.length}개)`;

    return { summary, insights, recommendations };
  };

  const selectedReport = weeklyReports.find(report => report.id === selectedWeek);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">주간 리포트를 생성하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">주간 리포트</h1>
        <p className="text-gray-600">
          AI 분석을 통한 주간 회고 인사이트와 개선 추천사항을 확인하세요.
        </p>
      </div>

      {weeklyReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 생성된 주간 리포트가 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              회고를 작성하면 자동으로 주간 리포트가 생성됩니다.
            </p>
            <Button onClick={() => window.location.href = '/retrospective'}>
              첫 회고 작성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">주간 리포트 목록</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {weeklyReports.map((report) => (
                  <Button
                    key={report.id}
                    variant={selectedWeek === report.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedWeek(report.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="text-sm">
                        {formatDate(report.weekStart)} ~
                      </div>
                      <div className="text-sm">
                        {formatDate(report.weekEnd)}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selectedReport && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>
                        {formatDate(selectedReport.weekStart)} ~ {formatDate(selectedReport.weekEnd)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedReport.entries.length}
                        </div>
                        <div className="text-sm text-blue-800">총 회고 수</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedReport.entries.filter(e => e.type === 'KPT').length}
                        </div>
                        <div className="text-sm text-green-800">KPT 회고</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedReport.entries.filter(e => e.type === 'PMI').length}
                        </div>
                        <div className="text-sm text-purple-800">PMI 회고</div>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {selectedReport.entries.filter(e => e.type === 'FREE').length}
                        </div>
                        <div className="text-sm text-amber-800">자유 작성</div>
                      </div>
                    </div>
                    <p className="text-gray-700">{selectedReport.aiAnalysis}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>주요 인사이트</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedReport.insights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span>개선 추천사항</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedReport.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-green-600 text-sm font-semibold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-gray-700">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>이번 주 회고 목록</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedReport.entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{formatDate(entry.date)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              entry.type === 'KPT' 
                                ? 'bg-blue-100 text-blue-800' 
                                : entry.type === 'PMI'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {entry.type === 'FREE' ? '자유' : entry.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}