'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { FreeContent } from '@/types';

interface FreeTemplateProps {
  initialData?: FreeContent;
  onSave: (data: FreeContent) => void;
  saving?: boolean;
}

export function FreeTemplate({ initialData, onSave, saving = false }: FreeTemplateProps) {
  const [text, setText] = useState<string>(initialData?.text ?? '');

  const handleSave = () => {
    const trimmed = text.trim();
    onSave({ text: trimmed });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>자유 작성</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="형식에 구애받지 않고 오늘의 생각과 배운 점을 자유롭게 기록해보세요."
          className="min-h-[240px]"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{text.trim().length}자</span>
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving ? '저장 중...' : '회고 저장하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

