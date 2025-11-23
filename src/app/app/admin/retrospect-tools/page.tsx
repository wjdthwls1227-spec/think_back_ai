'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminNav } from '../AdminNav';
import type { RetrospectTool } from '@/types';

const categories = ['노트', '필기구', '도서', '디지털', '기타'];

export default function AdminRetrospectToolsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<RetrospectTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '노트' as '노트' | '필기구' | '도서' | '디지털' | '기타',
    name: '',
    description: '',
    benefit: '',
    image_url: '',
    link_url: '',
    display_order: 0,
    is_published: true,
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

    loadTools();
  }, [user, isAdmin, router]);

  const loadTools = async () => {
    try {
      const { data, error } = await supabase
        .from('retrospect_tools')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tools:', error);
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          setMessage({ 
            type: 'error', 
            text: 'retrospect_tools 테이블이 아직 생성되지 않았습니다. Supabase에서 database/add-retrospect-tools.sql 파일을 실행해주세요.' 
          });
        } else {
          setMessage({ type: 'error', text: `도구 목록을 불러오는 중 오류가 발생했습니다: ${error.message}` });
        }
        setTools([]);
        return;
      }
      setTools(data || []);
      setMessage(null);
    } catch (error: unknown) {
      console.error('Error loading tools:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setMessage({ 
        type: 'error', 
        text: `도구 목록을 불러오는 중 오류가 발생했습니다: ${errorMessage}` 
      });
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tool: RetrospectTool) => {
    setEditingId(tool.id);
    setFormData({
      category: tool.category,
      name: tool.name,
      description: tool.description || '',
      benefit: tool.benefit || '',
      image_url: tool.image_url || '',
      link_url: tool.link_url || '',
      display_order: tool.display_order || 0,
      is_published: tool.is_published ?? true,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      category: '노트',
      name: '',
      description: '',
      benefit: '',
      image_url: '',
      link_url: '',
      display_order: 0,
      is_published: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!formData.name.trim()) {
        setMessage({ type: 'error', text: '도구 이름을 입력해주세요.' });
        setSaving(false);
        return;
      }

      if (!formData.link_url.trim()) {
        setMessage({ type: 'error', text: '링크 URL을 입력해주세요.' });
        setSaving(false);
        return;
      }

      const toolData = {
        category: formData.category,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        benefit: formData.benefit?.trim() || null,
        image_url: formData.image_url?.trim() || null,
        link_url: formData.link_url.trim(),
        display_order: formData.display_order,
        is_published: formData.is_published,
      };

      let error;
      if (editingId) {
        const result = await supabase
          .from('retrospect_tools')
          .update(toolData)
          .eq('id', editingId);
        error = result.error;
      } else {
        const result = await supabase
          .from('retrospect_tools')
          .insert(toolData);
        error = result.error;
      }

      if (error) {
        console.error('Error saving tool:', error);
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          setMessage({ 
            type: 'error', 
            text: 'retrospect_tools 테이블이 아직 생성되지 않았습니다. Supabase에서 database/add-retrospect-tools.sql 파일을 실행해주세요.' 
          });
        } else if (error.code === '42501') {
          setMessage({ type: 'error', text: '권한이 없습니다. 어드민 권한을 확인해주세요.' });
        } else {
          setMessage({ type: 'error', text: `저장 중 오류가 발생했습니다: ${error.message}` });
        }
        setSaving(false);
        return;
      }

      setMessage({ type: 'success', text: editingId ? '도구가 성공적으로 수정되었습니다.' : '도구가 성공적으로 생성되었습니다.' });
      handleCancel();
      await loadTools();
      
      // 성공 메시지 3초 후 자동 제거
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error saving tool:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setMessage({ type: 'error', text: `저장 중 오류가 발생했습니다: ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('retrospect_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div>
        <AdminNav />
        <div className="text-center py-12">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      <AdminNav />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          회고 도구 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          회고 도구를 등록, 수정, 삭제할 수 있습니다.
        </p>
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* 생성/수정 폼 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            {editingId ? '도구 수정' : '새 도구 생성'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as '노트' | '필기구' | '도서' | '디지털' | '기타' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  표시 순서
                </label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                도구 이름 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="예: 회고 전용 노트"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                설명 (HTML 지원)
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="도구에 대한 설명을 HTML로 작성할 수 있습니다. 예: &lt;p&gt;설명&lt;/p&gt; 또는 &lt;ul&gt;&lt;li&gt;항목&lt;/li&gt;&lt;/ul&gt;"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                HTML 태그를 사용하여 서식 있는 텍스트를 작성할 수 있습니다.
              </p>
              {formData.description && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">미리보기:</p>
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                효과/장점 (HTML 지원)
              </label>
              <Textarea
                value={formData.benefit}
                onChange={(e) => setFormData({ ...formData, benefit: e.target.value })}
                placeholder="이 도구를 사용하면 얻을 수 있는 효과나 장점을 HTML로 작성할 수 있습니다."
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                HTML 태그를 사용하여 서식 있는 텍스트를 작성할 수 있습니다.
              </p>
              {formData.benefit && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">미리보기:</p>
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.benefit }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이미지 URL
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                링크 URL *
              </label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                required
                placeholder="https://example.com 또는 쿠팡파트너스 링크"
                type="url"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                쿠팡파트너스 링크를 포함한 모든 링크를 입력할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_published" className="text-sm text-gray-700 dark:text-gray-300">
                공개 (체크 해제 시 숨김)
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? '저장 중...' : editingId ? '수정' : '생성'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                  취소
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 도구 리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>도구 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    이름
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    카테고리
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    링크
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    공개
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {tool.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {tool.category}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <a
                        href={tool.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs block"
                      >
                        {tool.link_url}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {tool.is_published ? (
                        <span className="text-green-600 dark:text-green-400">공개</span>
                      ) : (
                        <span className="text-gray-400">숨김</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tool)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tool.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tools.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      등록된 도구가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

