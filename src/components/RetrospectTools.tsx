'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { RetrospectTool } from '@/types';

const categories: (RetrospectTool['category'] | '전체')[] = ['전체', '노트', '필기구', '도서', '디지털', '기타'];

export function RetrospectTools() {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [tools, setTools] = useState<RetrospectTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTools = async () => {
      try {
        const { data, error } = await supabase
          .from('retrospect_tools')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTools((data || []) as RetrospectTool[]);
      } catch (error: unknown) {
        console.error('Error loading tools:', error);
        // 테이블이 없으면 빈 배열로 설정 (에러 메시지는 표시하지 않음)
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    loadTools();
  }, []);

  const filteredTools = selectedCategory === '전체' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="w-full">
      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 도구 카드 리스트 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          도구를 불러오는 중...
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          등록된 도구가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start max-w-7xl mx-auto">
          {filteredTools.map((tool) => (
          <Card key={tool.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col items-center text-center">
              <h3 className="font-semibold text-lg mb-3 dark:text-gray-100">{tool.name}</h3>
              <div className="flex-1 space-y-3 w-full">
                {tool.description && (
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none text-center [&>*]:text-center [&>*]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: tool.description }}
                  />
                )}
                {tool.benefit && (
                  <div 
                    className="text-xs text-blue-600 dark:text-blue-400 prose prose-sm dark:prose-invert max-w-none text-center [&>*]:text-center [&>*]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: tool.benefit }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}

