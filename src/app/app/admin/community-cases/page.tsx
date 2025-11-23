'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNav } from '../AdminNav';

export default function AdminCommunityCasesPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    body: '',
    category: '',
    is_featured: false,
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

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('community_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (caseItem: any) => {
    setEditingId(caseItem.id);
    setFormData({
      title: caseItem.title,
      subtitle: caseItem.subtitle || '',
      body: caseItem.body || '',
      category: caseItem.category || '',
      is_featured: caseItem.is_featured || false,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      body: '',
      category: '',
      is_featured: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('community_cases')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_cases')
          .insert(formData);

        if (error) throw error;
      }

      handleCancel();
      loadCases();
    } catch (error: any) {
      alert(`오류: ${error.message}`);
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
    } catch (error: any) {
      alert(`오류: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div>
      <AdminNav />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          커뮤니티 사례 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          회고 칼럼의 회고 정보, 커뮤니티 소식, 회고 사례를 관리할 수 있습니다.
        </p>
      </div>

      {/* 생성/수정 폼 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? '사례 수정' : '새 사례 생성'}
          </CardTitle>
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
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="회고 정보, 커뮤니티 소식, 회고 사례 등"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                본문 *
              </label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={8}
                required
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
              <Button type="submit">
                {editingId ? '수정하기' : '생성하기'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 사례 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>사례 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    제목
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    카테고리
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    추천
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    생성일
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {caseItem.title}
                        </span>
                        {caseItem.subtitle && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {caseItem.subtitle}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {caseItem.category || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {caseItem.is_featured ? (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs flex items-center w-fit">
                          <Star className="w-3 h-3 mr-1" />
                          추천
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(caseItem.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(caseItem)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(caseItem.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

