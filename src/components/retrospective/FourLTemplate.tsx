'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { FourLContent } from '@/types';

interface FourLTemplateProps {
  initialData?: FourLContent;
  onSave: (data: FourLContent) => void;
  saving?: boolean;
}

export function FourLTemplate({ initialData, onSave, saving = false }: FourLTemplateProps) {
  const [liked, setLiked] = useState<string[]>(initialData?.liked || ['']);
  const [learned, setLearned] = useState<string[]>(initialData?.learned || ['']);
  const [lacked, setLacked] = useState<string[]>(initialData?.lacked || ['']);
  const [longedFor, setLongedFor] = useState<string[]>(initialData?.longedFor || ['']);

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
    const data: FourLContent = {
      liked: liked.filter(item => item.trim() !== ''),
      learned: learned.filter(item => item.trim() !== ''),
      lacked: lacked.filter(item => item.trim() !== ''),
      longedFor: longedFor.filter(item => item.trim() !== ''),
    };
    onSave(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="text-green-700 dark:text-green-400 flex items-center justify-between">
              Liked (좋았던 점)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setLiked)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {liked.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setLiked)}
                  placeholder="좋았던 점을 입력하세요..."
                  className="min-h-[80px]"
                />
                {liked.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setLiked)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center justify-between">
              Learned (배운 점)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setLearned)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {learned.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setLearned)}
                  placeholder="배운 점을 입력하세요..."
                  className="min-h-[80px]"
                />
                {learned.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setLearned)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-orange-50 dark:bg-orange-900/20">
            <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center justify-between">
              Lacked (부족했던 점)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setLacked)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lacked.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setLacked)}
                  placeholder="부족했던 점을 입력하세요..."
                  className="min-h-[80px]"
                />
                {lacked.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setLacked)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
            <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center justify-between">
              Longed for (원했던 점)
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addItem(setLongedFor)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {longedFor.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value, setLongedFor)}
                  placeholder="원했던 점을 입력하세요..."
                  className="min-h-[80px]"
                />
                {longedFor.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index, setLongedFor)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </div>
  );
}

