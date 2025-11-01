'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/utils';
import { RetrospectiveEntry, KPTContent, PMIContent, FreeContent } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar, Search, FileText } from 'lucide-react';

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<RetrospectiveEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<RetrospectiveEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'KPT' | 'PMI' | 'FREE'>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
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
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = entries;

    if (filterType !== 'all') {
      filtered = filtered.filter(entry => entry.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const content = entry.content;
        const searchString = searchTerm.toLowerCase();
        
        if (entry.type === 'KPT') {
          const kptContent = content as KPTContent;
          return (
            kptContent.keep.some(item => item.toLowerCase().includes(searchString)) ||
            kptContent.problem.some(item => item.toLowerCase().includes(searchString)) ||
            kptContent.try.some(item => item.toLowerCase().includes(searchString))
          );
        }

        if (entry.type === 'PMI') {
          const pmiContent = content as PMIContent;
          return (
            pmiContent.plus.some(item => item.toLowerCase().includes(searchString)) ||
            pmiContent.minus.some(item => item.toLowerCase().includes(searchString)) ||
            pmiContent.interesting.some(item => item.toLowerCase().includes(searchString))
          );
        }

        const freeContent = content as FreeContent;
        return freeContent.text.toLowerCase().includes(searchString);
      });
    }

    setFilteredEntries(filtered);
  }, [entries, searchTerm, filterType]);

  const renderKPTContent = (content: KPTContent) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold text-green-700 mb-2">Keep (계속할 것)</h4>
        <ul className="space-y-1">
          {content.keep.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-red-700 mb-2">Problem (문제점)</h4>
        <ul className="space-y-1">
          {content.problem.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-blue-700 mb-2">Try (시도할 것)</h4>
        <ul className="space-y-1">
          {content.try.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderPMIContent = (content: PMIContent) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold text-green-700 mb-2">Plus (좋았던 것)</h4>
        <ul className="space-y-1">
          {content.plus.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-green-50 rounded border-l-4 border-green-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-red-700 mb-2">Minus (아쉬웠던 것)</h4>
        <ul className="space-y-1">
          {content.minus.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-red-50 rounded border-l-4 border-red-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold text-yellow-700 mb-2">Interesting (흥미로웠던 것)</h4>
        <ul className="space-y-1">
          {content.interesting.map((item, index) => (
            <li key={index} className="text-sm p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderFreeContent = (content: FreeContent) => (
    <div>
      <h4 className="font-semibold text-amber-700 mb-2">자유 작성</h4>
      <p className="text-sm leading-relaxed whitespace-pre-line bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
        {content.text || '작성된 내용이 없습니다.'}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">회고 히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">회고 히스토리</h1>
        <p className="text-gray-600">
          지금까지 작성한 회고를 확인하고 성장 과정을 추적해보세요.
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="회고 내용 검색..."
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
            variant={filterType === 'KPT' ? 'default' : 'outline'}
            onClick={() => setFilterType('KPT')}
            size="sm"
          >
            KPT
          </Button>
          <Button
            variant={filterType === 'PMI' ? 'default' : 'outline'}
            onClick={() => setFilterType('PMI')}
            size="sm"
          >
            PMI
          </Button>
          <Button
            variant={filterType === 'FREE' ? 'default' : 'outline'}
            onClick={() => setFilterType('FREE')}
            size="sm"
          >
            자유 작성
          </Button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {entries.length === 0 ? '작성된 회고가 없습니다' : '검색 결과가 없습니다'}
            </h3>
            <p className="text-gray-600 mb-4">
              {entries.length === 0 
                ? '첫 번째 회고를 작성해보세요!' 
                : '다른 검색어로 시도해보세요.'
              }
            </p>
            {entries.length === 0 && (
              <Button onClick={() => window.location.href = '/retrospective'}>
                회고 작성하기
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>{formatDate(entry.date)}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.type === 'KPT'
                          ? 'bg-blue-100 text-blue-800'
                          : entry.type === 'PMI'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.type === 'FREE' ? '자유' : entry.type}
                    </span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedEntry(
                      expandedEntry === entry.id ? null : entry.id
                    )}
                  >
                    {expandedEntry === entry.id ? '접기' : '펼치기'}
                  </Button>
                </div>
              </CardHeader>
              {expandedEntry === entry.id && (
                <CardContent>
                  {entry.type === 'KPT' && renderKPTContent(entry.content as KPTContent)}
                  {entry.type === 'PMI' && renderPMIContent(entry.content as PMIContent)}
                  {entry.type === 'FREE' && renderFreeContent(entry.content as FreeContent)}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}