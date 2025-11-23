'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Search, FileText, Edit, X, Save } from 'lucide-react';
import { RetrospectLayout } from '@/components/retrospect/RetrospectLayout';
import { FreeTemplate } from '@/components/retrospective/FreeTemplate';
import { KPTTemplate } from '@/components/retrospective/KPTTemplate';
import { PMITemplate } from '@/components/retrospective/PMITemplate';
import { FourLTemplate } from '@/components/retrospective/FourLTemplate';
import { FreeContentViewer } from '@/components/retrospective/FreeContentViewer';
import { extractPlainTextFromFreeContent, normalizeFreeContent } from '@/lib/utils';
import { KPTContent, PMIContent, FreeContent, FourLContent } from '@/types';

interface Journal {
  id: string;
  user_id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
  title: string | null;
  content: any;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <RetrospectLayout>
        <HistoryContent />
      </RetrospectLayout>
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null);
  const [editingJournal, setEditingJournal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchJournals();
    }
  }, [user]);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }); // 작성일자 기준 정렬

      if (error) {
        console.error('Error fetching journals:', error);
      } else {
        setJournals(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = journals;

    if (filterType !== 'all') {
      filtered = filtered.filter(journal => journal.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(journal => {
        const content = journal.content;
        const searchString = searchTerm.toLowerCase();
        
        // 제목 검색
        if (journal.title && journal.title.toLowerCase().includes(searchString)) {
          return true;
        }
        
        // content 타입에 따라 검색
        if (content.keep || content.problem || content.try) {
          // KPT
          const kpt = content as KPTContent;
          return (
            kpt.keep?.some(item => item.toLowerCase().includes(searchString)) ||
            kpt.problem?.some(item => item.toLowerCase().includes(searchString)) ||
            kpt.try?.some(item => item.toLowerCase().includes(searchString))
          );
        }
        
        if (content.plus || content.minus || content.interesting) {
          // PMI
          const pmi = content as PMIContent;
          return (
            pmi.plus?.some(item => item.toLowerCase().includes(searchString)) ||
            pmi.minus?.some(item => item.toLowerCase().includes(searchString)) ||
            pmi.interesting?.some(item => item.toLowerCase().includes(searchString))
          );
        }
        
        if (content.liked || content.learned || content.lacked || content.longedFor) {
          // 4L
          const fourL = content as FourLContent;
          return (
            fourL.liked?.some(item => item.toLowerCase().includes(searchString)) ||
            fourL.learned?.some(item => item.toLowerCase().includes(searchString)) ||
            fourL.lacked?.some(item => item.toLowerCase().includes(searchString)) ||
            fourL.longedFor?.some(item => item.toLowerCase().includes(searchString))
          );
        }
        
        // FREE
        const free = content as FreeContent;
        return extractPlainTextFromFreeContent(free).toLowerCase().includes(searchString);
      });
    }

    setFilteredJournals(filtered);
  }, [journals, searchTerm, filterType]);

  const handleEdit = (journalId: string) => {
    setEditingJournal(journalId);
    setExpandedJournal(journalId);
  };

  const handleCancelEdit = () => {
    setEditingJournal(null);
  };

  const handleSaveEdit = async (journalId: string, title: string, content: KPTContent | PMIContent | FreeContent | FourLContent) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('journals')
        .update({ 
          title: title.trim(),
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', journalId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating journal:', error);
        alert('수정 중 오류가 발생했습니다.');
      } else {
        setEditingJournal(null);
        fetchJournals(); // 목록 새로고침
      }
    } catch (error) {
      console.error('Error:', error);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const getContentType = (content: any): 'KPT' | 'PMI' | 'FREE' | '4L' => {
    if (content.keep || content.problem || content.try) return 'KPT';
    if (content.plus || content.minus || content.interesting) return 'PMI';
    if (content.liked || content.learned || content.lacked || content.longedFor) return '4L';
    return 'FREE';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = (journal: Journal) => {
    const contentType = getContentType(journal.content);

    if (editingJournal === journal.id) {
      return (
        <EditJournalContent
          journal={journal}
          onSave={(content) => handleSaveEdit(journal.id, content)}
          onCancel={handleCancelEdit}
          saving={saving}
        />
      );
    }

    if (contentType === 'KPT') {
      const kpt = journal.content as KPTContent;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Keep (계속할 것)</h4>
            <ul className="space-y-1">
              {kpt.keep?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Problem (문제점)</h4>
            <ul className="space-y-1">
              {kpt.problem?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Try (시도할 것)</h4>
            <ul className="space-y-1">
              {kpt.try?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (contentType === 'PMI') {
      const pmi = journal.content as PMIContent;
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Plus (좋았던 것)</h4>
            <ul className="space-y-1">
              {pmi.plus?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Minus (아쉬웠던 것)</h4>
            <ul className="space-y-1">
              {pmi.minus?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Interesting (흥미로웠던 것)</h4>
            <ul className="space-y-1">
              {pmi.interesting?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (contentType === '4L') {
      const fourL = journal.content as FourLContent;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Liked (좋았던 점)</h4>
            <ul className="space-y-1">
              {fourL.liked?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-4 border-green-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Learned (배운 점)</h4>
            <ul className="space-y-1">
              {fourL.learned?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">Lacked (부족했던 점)</h4>
            <ul className="space-y-1">
              {fourL.lacked?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">Longed for (원했던 점)</h4>
            <ul className="space-y-1">
              {fourL.longedFor?.map((item, index) => (
                <li key={index} className="text-sm p-2 bg-purple-50 dark:bg-purple-900/20 rounded border-l-4 border-purple-500">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    // FREE
    const free = journal.content as FreeContent;
    return (
      <div>
        <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">자유 작성</h4>
        <FreeContentViewer content={normalizeFreeContent(free)} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">회고 히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">회고 히스토리</h1>
        <p className="text-gray-600 dark:text-gray-400">
          지금까지 작성한 회고를 확인하고 수정할 수 있습니다.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="제목 또는 내용으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            size="sm"
          >
            전체
          </Button>
          <Button
            variant={filterType === 'daily' ? 'default' : 'outline'}
            onClick={() => setFilterType('daily')}
            size="sm"
          >
            일일
          </Button>
          <Button
            variant={filterType === 'weekly' ? 'default' : 'outline'}
            onClick={() => setFilterType('weekly')}
            size="sm"
          >
            주간
          </Button>
          <Button
            variant={filterType === 'monthly' ? 'default' : 'outline'}
            onClick={() => setFilterType('monthly')}
            size="sm"
          >
            월간
          </Button>
        </div>
      </div>

      {filteredJournals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {journals.length === 0 ? '작성된 회고가 없습니다' : '검색 결과가 없습니다'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {journals.length === 0 
                ? '첫 번째 회고를 작성해보세요!' 
                : '다른 검색어로 시도해보세요.'
              }
            </p>
            {journals.length === 0 && (
              <Button onClick={() => window.location.href = '/app/journal'}>
                회고 작성하기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJournals.map((journal) => (
            <Card key={journal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-semibold text-lg">
                        {journal.title || '제목 없음'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-normal">
                        ({formatDate(journal.date)})
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          journal.type === 'daily'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : journal.type === 'weekly'
                              ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        }`}
                      >
                        {journal.type === 'daily' ? '일일' : journal.type === 'weekly' ? '주간' : '월간'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getContentType(journal.content) === 'KPT'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : getContentType(journal.content) === 'PMI'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                            : getContentType(journal.content) === '4L'
                              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                              : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                      }`}>
                        {getContentType(journal.content) === 'FREE' ? '자유' : getContentType(journal.content)}
                      </span>
                    </CardTitle>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>작성일: {formatDateTime(journal.created_at)}</p>
                      {journal.updated_at !== journal.created_at && (
                        <p>수정일: {formatDateTime(journal.updated_at)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {editingJournal !== journal.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(journal.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedJournal(
                        expandedJournal === journal.id ? null : journal.id
                      )}
                    >
                      {expandedJournal === journal.id ? '접기' : '펼치기'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {expandedJournal === journal.id && (
                <CardContent>
                  {editingJournal === journal.id ? (
                    <EditJournalContent
                      journal={journal}
                      onSave={(title, content) => handleSaveEdit(journal.id, title, content)}
                      onCancel={handleCancelEdit}
                      saving={saving}
                    />
                  ) : (
                    renderContent(journal)
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// 수정 모드 컴포넌트
function EditJournalContent({
  journal,
  onSave,
  onCancel,
  saving,
}: {
  journal: Journal;
  onSave: (title: string, content: KPTContent | PMIContent | FreeContent | FourLContent) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const contentType = getContentType(journal.content);
  const [title, setTitle] = useState(journal.title || '');

  const handleSave = (data: KPTContent | PMIContent | FreeContent | FourLContent) => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    onSave(title.trim(), data);
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            제목
          </label>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4 mr-1" />
            취소
          </Button>
        </div>
        <Input
          type="text"
          placeholder="회고 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
          maxLength={100}
        />
      </div>

      {contentType === 'KPT' && (
        <KPTTemplate
          initialData={journal.content as KPTContent}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {contentType === 'PMI' && (
        <PMITemplate
          initialData={journal.content as PMIContent}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {contentType === '4L' && (
        <FourLTemplate
          initialData={journal.content as FourLContent}
          onSave={handleSave}
          saving={saving}
        />
      )}
      {contentType === 'FREE' && (
        <FreeTemplate
          initialData={journal.content as FreeContent}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}

function getContentType(content: any): 'KPT' | 'PMI' | 'FREE' | '4L' {
  if (content.keep || content.problem || content.try) return 'KPT';
  if (content.plus || content.minus || content.interesting) return 'PMI';
  if (content.liked || content.learned || content.lacked || content.longedFor) return '4L';
  return 'FREE';
}
