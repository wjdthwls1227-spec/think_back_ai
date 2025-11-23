'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Content } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Users, Package, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNav } from '../AdminNav';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const typeIcons = {
  workbook: BookOpen,
  cohort: Users,
  bundle: Package,
};

const typeLabels = {
  workbook: '워크북',
  cohort: '커뮤니티',
  bundle: '패키지',
};

export default function AdminContentsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    type: 'workbook' as 'workbook' | 'cohort' | 'bundle',
    title: '',
    subtitle: '',
    description: '',
    thumbnail_image_url: '',
    detail_image_url: '',
    price: 0,
    is_published: false,
    meta: '',
  });

  useEffect(() => {
    console.log('AdminContentsPage - user:', user?.email, 'isAdmin:', isAdmin);
    
    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      console.log('Not admin, redirecting to dashboard');
      router.push('/app/dashboard');
      return;
    }

    console.log('Loading contents...');
    loadContents();
  }, [user, isAdmin, router]);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContents(contents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contents.filter((content) => {
      return (
        content.title.toLowerCase().includes(query) ||
        content.subtitle?.toLowerCase().includes(query) ||
        content.slug.toLowerCase().includes(query) ||
        typeLabels[content.type as keyof typeof typeLabels].toLowerCase().includes(query)
      );
    });
    setFilteredContents(filtered);
  }, [searchQuery, contents]);

  const loadContents = async () => {
    try {
      console.log('loadContents: Starting to fetch contents...');
      const { data, error } = await supabase
        .from('contents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('loadContents: Error fetching contents:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log('loadContents: Fetched contents:', data?.length || 0, 'items');
      setContents(data || []);
      setFilteredContents(data || []);
    } catch (error: unknown) {
      console.error('Error loading contents:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`콘텐츠 목록을 불러오는 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setFormData({
      slug: content.slug,
      type: content.type,
      title: content.title,
      subtitle: content.subtitle || '',
      description: content.description || '',
      thumbnail_image_url: content.thumbnail_image_url || '',
      detail_image_url: content.detail_image_url || '',
      price: content.price,
      is_published: content.is_published,
      meta: content.meta ? JSON.stringify(content.meta, null, 2) : '',
    });
    setShowForm(true);
    // 폼으로 스크롤
    setTimeout(() => {
      document.getElementById('content-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      slug: '',
      type: 'workbook',
      title: '',
      subtitle: '',
      description: '',
      thumbnail_image_url: '',
      detail_image_url: '',
      price: 0,
      is_published: false,
      meta: '',
    });
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('content-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      slug: '',
      type: 'workbook',
      title: '',
      subtitle: '',
      description: '',
      thumbnail_image_url: '',
      detail_image_url: '',
      price: 0,
      is_published: false,
      meta: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('handleSubmit called with formData:', formData);
    console.log('Current user:', user?.email, 'isAdmin:', isAdmin);

    // 필수 필드 검증
    if (!formData.slug || !formData.title || !formData.price) {
      alert('필수 필드(Slug, 제목, 가격)를 모두 입력해주세요.');
      return;
    }

    // 어드민 권한 재확인
    if (!isAdmin) {
      alert('관리자 권한이 필요합니다. 현재 사용자: ' + (user?.email || '없음'));
      return;
    }

    try {
      // Meta JSON 파싱
      let parsedMeta = null;
      if (formData.meta && formData.meta.trim()) {
        try {
          parsedMeta = JSON.parse(formData.meta);
        } catch (parseError) {
          alert(`Meta JSON 파싱 오류: ${parseError instanceof Error ? parseError.message : String(parseError)}\n\n올바른 JSON 형식으로 입력해주세요.`);
          return;
        }
      }

      // description이 너무 길면 경고 (base64 이미지 포함 시 매우 클 수 있음)
      if (formData.description && formData.description.length > 1000000) {
        const confirmContinue = confirm(
          `설명이 매우 깁니다 (${Math.round(formData.description.length / 1000)}KB).\n` +
          `Base64 이미지가 포함되어 있으면 매우 클 수 있습니다.\n\n` +
          `계속하시겠습니까?`
        );
        if (!confirmContinue) {
          return;
        }
      }

      const contentData: Partial<Content> = {
        slug: formData.slug.trim(),
        type: formData.type,
        title: formData.title.trim(),
        subtitle: formData.subtitle?.trim() || null,
        description: formData.description || null,
        price: Number(formData.price),
        is_published: formData.is_published,
        meta: parsedMeta,
      };

      // 이미지 URL 필드는 컬럼이 존재하는 경우에만 추가
      if (formData.thumbnail_image_url?.trim()) {
        contentData.thumbnail_image_url = formData.thumbnail_image_url.trim();
      }
      if (formData.detail_image_url?.trim()) {
        contentData.detail_image_url = formData.detail_image_url.trim();
      }

      // null 값 제거
      Object.keys(contentData).forEach(key => {
        const typedKey = key as keyof typeof contentData;
        if (contentData[typedKey] === '') {
          (contentData as Record<string, unknown>)[typedKey] = null;
        }
      });

      console.log('Submitting contentData:', contentData);

      let result;
      if (editingId) {
        const { data, error } = await supabase
          .from('contents')
          .update(contentData)
          .eq('id', editingId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update success:', data);
        result = data;
      } else {
        console.log('Attempting to insert content...');
        const { data, error } = await supabase
          .from('contents')
          .insert(contentData)
          .select();

        if (error) {
          console.error('Insert error - Full error object:', error);
          throw error;
        }
        console.log('Insert success:', data);
        result = data;
      }

      if (!result || result.length === 0) {
        console.warn('No data returned from insert/update');
        alert('저장은 완료되었지만 데이터를 확인할 수 없습니다. 목록을 새로고침해주세요.');
      } else {
        console.log('Saved content:', result[0]);
        alert(editingId ? '콘텐츠가 수정되었습니다.' : '콘텐츠가 생성되었습니다.');
      }

      handleCancel();
      console.log('Reloading contents list...');
      await loadContents();
      console.log('Contents list reloaded');
    } catch (error: unknown) {
      console.error('Submit error - Full error:', error);
      const errorObj = error && typeof error === 'object' ? error as { message?: string; error_description?: string; details?: string; hint?: string; error?: string; code?: string } : null;
      const errorMessage = errorObj?.message || errorObj?.error_description || '알 수 없는 오류가 발생했습니다.';
      const errorDetails = errorObj?.details || errorObj?.hint || errorObj?.error || '';
      const errorCode = errorObj?.code || '';
      
      let fullErrorMessage = `오류: ${errorMessage}`;
      if (errorCode) {
        fullErrorMessage += `\n코드: ${errorCode}`;
      }
      if (errorDetails) {
        fullErrorMessage += `\n\n상세: ${errorDetails}`;
      }
      fullErrorMessage += `\n\n브라우저 콘솔을 확인해주세요.`;
      
      alert(fullErrorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadContents();
      alert('콘텐츠가 삭제되었습니다.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      alert(`오류: ${errorMessage}`);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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

  if (!isAdmin) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">관리자 권한이 없습니다.</p>
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
              회고 콘텐츠 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              회고 콘텐츠를 등록, 수정, 삭제할 수 있습니다.
            </p>
          </div>
          <Button onClick={handleNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 콘텐츠 작성
          </Button>
        </div>
      </div>

      {/* 검색 바 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="제목, 부제목, Slug로 검색..."
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
        <Card id="content-form" className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingId ? '콘텐츠 수정' : '새 콘텐츠 생성'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Slug *
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="daily-retrospect-workbook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    타입 *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'workbook' | 'cohort' | 'bundle' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    required
                  >
                    <option value="workbook">워크북</option>
                    <option value="cohort">커뮤니티</option>
                    <option value="bundle">패키지</option>
                  </select>
                </div>
              </div>

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명 (네이버 블로그 스타일 에디터)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  네이버 블로그처럼 이미지, 텍스트 서식, 리스트 등을 쉽게 작성할 수 있습니다.
                </p>
                <RichTextEditor
                  initialData={formData.description}
                  onChange={(html) => setFormData({ ...formData, description: html })}
                  placeholder="상품 설명을 작성하세요. 이미지, 제목, 리스트 등을 자유롭게 사용할 수 있습니다."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    썸네일 이미지 URL
                  </label>
                  <Input
                    type="url"
                    value={formData.thumbnail_image_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.thumbnail_image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.thumbnail_image_url} 
                        alt="썸네일 미리보기"
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    상세 이미지 URL
                  </label>
                  <Input
                    type="url"
                    value={formData.detail_image_url}
                    onChange={(e) => setFormData({ ...formData, detail_image_url: e.target.value })}
                    placeholder="https://example.com/detail-image.jpg"
                  />
                  {formData.detail_image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.detail_image_url} 
                        alt="상세 이미지 미리보기"
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    가격 (원) *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">공개</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta (JSON) - 문제, 효과, 커리큘럼 등
                </label>
                <Textarea
                  value={formData.meta}
                  onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder={`{
  "problem": "이 콘텐츠가 해결하는 문제 (HTML 지원)",
  "benefit": "기대되는 변화 (HTML 지원)",
  "curriculum": ["1주차: 회고의 기초", "2주차: KPT 템플릿 활용"],
  "description": "상세 설명 (HTML 지원)"
}`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  problem, benefit, description 필드는 HTML을 지원합니다.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? '수정하기' : '생성하기'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 콘텐츠 카드 리스트 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          콘텐츠 목록 ({filteredContents.length}개)
        </h2>
      </div>

      {filteredContents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? '검색 결과가 없습니다.' : '등록된 콘텐츠가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContents.map((content) => {
            const Icon = typeIcons[content.type as keyof typeof typeIcons];
            return (
              <Card
                key={content.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleEdit(content)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {typeLabels[content.type as keyof typeof typeLabels]}
                      </span>
                    </div>
                    {content.is_published ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        공개
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                        비공개
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {content.title}
                  </h3>
                  
                  {content.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {content.subtitle}
                    </p>
                  )}

                  {content.thumbnail_image_url && (
                    <div className="mb-3">
                      <img
                        src={content.thumbnail_image_url}
                        alt={content.title}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(content.price)}원
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(content);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(content.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(content.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
