'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { PMIContent } from '@/types';

interface PMITemplateProps {
  initialData?: PMIContent;
  onSave: (data: PMIContent) => void;
  saving?: boolean;
}

export function PMITemplate({ initialData, onSave, saving = false }: PMITemplateProps) {
  const [plus, setPlus] = useState<string[]>(initialData?.plus || ['']);
  const [minus, setMinus] = useState<string[]>(initialData?.minus || ['']);
  const [interesting, setInteresting] = useState<string[]>(initialData?.interesting || ['']);

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
    const data: PMIContent = {
      plus: plus.filter(item => item.trim() !== ''),
      minus: minus.filter(item => item.trim() !== ''),
      interesting: interesting.filter(item => item.trim() !== ''),
    };
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-700 flex items-center justify-between">
              Plus (좋았던 것)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setPlus)}
                className="text-green-600 hover:text-green-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {plus.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="긍정적이었던 것, 성공적이었던 것을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setPlus)}
                  className="min-h-[80px]"
                />
                {plus.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setPlus)}
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
              Minus (아쉬웠던 것)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setMinus)}
                className="text-red-600 hover:text-red-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {minus.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="부정적이었던 것, 개선이 필요한 것을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setMinus)}
                  className="min-h-[80px]"
                />
                {minus.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setMinus)}
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
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-yellow-700 flex items-center justify-between">
              Interesting (흥미로웠던 것)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setInteresting)}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {interesting.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  placeholder="흥미로웠던 것, 새로 배운 것을 작성하세요"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setInteresting)}
                  className="min-h-[80px]"
                />
                {interesting.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setInteresting)}
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