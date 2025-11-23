'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { KPTContent } from '@/types';

interface KPTTemplateProps {
  initialData?: KPTContent;
  onSave: (data: KPTContent) => void;
  saving?: boolean;
}

export function KPTTemplate({ initialData, onSave, saving = false }: KPTTemplateProps) {
  const [keep, setKeep] = useState<string[]>(initialData?.keep || ['']);
  const [problem, setProblem] = useState<string[]>(initialData?.problem || ['']);
  const [tryItems, setTryItems] = useState<string[]>(initialData?.try || ['']);

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const removeItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleSave = () => {
    const data: KPTContent = {
      keep: keep.filter(item => item.trim() !== ''),
      problem: problem.filter(item => item.trim() !== ''),
      try: tryItems.filter(item => item.trim() !== ''),
    };
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-700 flex items-center justify-between">
              Keep (계속할 것)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setKeep)}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {keep.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="잘했던 것, 계속 유지할 것을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setKeep)}
                  className="min-h-[80px]"
                />
                {keep.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setKeep)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700 flex items-center justify-between">
              Problem (문제점)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setProblem)}
                className="text-red-600 hover:text-red-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {problem.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="문제가 되었던 것, 개선이 필요한 것을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setProblem)}
                  className="min-h-[80px]"
                />
                {problem.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setProblem)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-700 flex items-center justify-between">
              Try (시도할 것)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setTryItems)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {tryItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="새로 시도해볼 것, 개선 방안을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setTryItems)}
                  className="min-h-[80px]"
                />
                {tryItems.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setTryItems)}
                    className="text-red-500 hover:text-red-700 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={saving}>
          {saving ? '저장 중...' : '회고 저장하기'}
        </Button>
      </div>
    </div>
  );
}