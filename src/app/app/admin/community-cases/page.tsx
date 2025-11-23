'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Star, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNav } from '../AdminNav';
import type { CommunityCase } from '@/types';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const CATEGORIES = ['회고정보', '커뮤니티소식', '회고 사례', '기타'] as const;
type CategoryType = typeof CATEGORIES[number];

export default function AdminCommunityCasesPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<CommunityCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<CommunityCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    body: '',
    category: '' as CategoryType | '',
    is_featured: false,
    image_url: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/app/dashboard');
      return;
    }

    loadCases();
  }, [user, isAdmin, router]);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCases(cases);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cases.filter((caseItem) => {
      return (
        caseItem.title.toLowerCase().includes(query) ||
        caseItem.subtitle?.toLowerCase().includes(query) ||
        caseItem.category?.toLowerCase().includes(query) ||
        caseItem.body?.toLowerCase().includes(query)
      );
    });
    setFilteredCases(filtered);
  }, [searchQuery, cases]);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('community_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
      setFilteredCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
      alert('사례 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (caseItem: CommunityCase) => {
    setEditingId(caseItem.id);
    setFormData({
      title: caseItem.title,
      subtitle: caseItem.subtitle || '',
      body: caseItem.body || '',
      category: (caseItem.category as CategoryType) || '',
      is_featured: caseItem.is_featured || false,
      image_url: caseItem.image_url || '',
    });
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('case-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      body: '',
      category: '',
      is_featured: false,
      image_url: '',
    });
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('case-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      title: '',
      subtitle: '',
      body: '',
      category: '',
      is_featured: false,
      image_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    console.log('handleSubmit called', { formData, editingId });

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: '제목을 입력해주세요.' });
      setSubmitting(false);
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || null,
        body: formData.body || null,
        category: formData.category || null,
        is_featured: formData.is_featured,
        image_url: formData.image_url?.trim() || null,
      };

      console.log('Submitting data:', submitData);

      if (editingId) {
        const { data, error } = await supabase
          .from('community_cases')
          .update(submitData)
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update success:', data);
        setMessage({ type: 'success', text: '칼럼이 수정되었습니다.' });
      } else {
        const { data, error } = await supabase
          .from('community_cases')
          .insert(submitData)
          .select();

        if (error) {
          console.error('Insert error:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }
        console.log('Insert success:', data);
        setMessage({ type: 'success', text: '칼럼이 생성되었습니다.' });
      }

      // 성공 후 폼 닫기 및 목록 새로고침
      setTimeout(() => {
        handleCancel();
        loadCases();
        setMessage(null);
      }, 1500);
    } catch (error: unknown) {
      console.error('Submit error:', error);
      const errorObj = error && typeof error === 'object' ? error as { message?: string; details?: string; hint?: string; code?: string } : null;
      const errorMessage = errorObj?.message || (error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      const errorDetails = errorObj?.details || errorObj?.hint || '';
      const fullError = errorDetails ? `${errorMessage}\n\n상세: ${errorDetails}` : errorMessage;
      
      setMessage({ type: 'error', text: fullError });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('community_cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadCases();
      alert('사례가 삭제되었습니다.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`오류: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              회고 칼럼 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              회고 정보, 커뮤니티 소식, 회고 사례를 관리할 수 있습니다.
            </p>
          </div>
          <Button onClick={handleNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 칼럼 작성
          </Button>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              message.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {message.text}
            </p>
            <button
              onClick={() => setMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 검색 바 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="제목, 부제목, 카테고리, 본문으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 생성/수정 폼 */}
      {showForm && (
        <Card id="case-form" className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? '칼럼 수정' : '새 칼럼 생성'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  제목 *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  부제목
                </label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType | '' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  이미지 URL
                </label>
                <Input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={formData.image_url} 
                      alt="이미지 미리보기"
                      className="w-full h-48 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  본문 (네이버 블로그 스타일 에디터) *
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  네이버 블로그처럼 이미지, 텍스트 서식, 리스트 등을 쉽게 작성할 수 있습니다.
                </p>
                <RichTextEditor
                  initialData={formData.body}
                  onChange={(html) => setFormData({ ...formData, body: html })}
                  placeholder="칼럼 본문을 작성하세요. 이미지, 제목, 리스트 등을 자유롭게 사용할 수 있습니다."
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    추천 사례로 표시
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingId ? '수정 중...' : '생성 중...'}
                    </>
                  ) : (
                    editingId ? '수정하기' : '생성하기'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 칼럼 카드 리스트 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          칼럼 목록 ({filteredCases.length}개)
        </h2>
      </div>

      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 칼럼이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleEdit(caseItem)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  {caseItem.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {caseItem.category}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    {caseItem.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        추천
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {caseItem.title}
                </h3>
                
                {caseItem.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {caseItem.subtitle}
                  </p>
                )}

                {caseItem.body && (
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: caseItem.body.length > 150 
                        ? caseItem.body.substring(0, 150) + '...' 
                        : caseItem.body 
                    }}
                  />
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(caseItem.created_at).toLocaleDateString('ko-KR')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(caseItem);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(caseItem.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
