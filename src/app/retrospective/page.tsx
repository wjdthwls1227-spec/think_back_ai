'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPTTemplate } from '@/components/retrospective/KPTTemplate';
import { PMITemplate } from '@/components/retrospective/PMITemplate';
import { FreeTemplate } from '@/components/retrospective/FreeTemplate';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { formatDate } from '@/lib/utils';
import { KPTContent, PMIContent, FreeContent } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function RetrospectivePage() {
  return (
    <ProtectedRoute>
      <RetrospectiveContent />
    </ProtectedRoute>
  );
}

function RetrospectiveContent() {
  const { user } = useAuth();
  const [templateType, setTemplateType] = useState<'KPT' | 'PMI' | 'FREE'>('KPT');
  const [savedMessage, setSavedMessage] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (content: KPTContent | PMIContent | FreeContent) => {
    console.log('=== 회고 저장 시작 ===');
    console.log('User:', user);
    console.log('Content:', content);
    console.log('Template Type:', templateType);

    if (!user) {
      console.error('User not found');
      setSavedMessage('로그인이 필요합니다.');
      return;
    }

    setSaving(true);
    setSavedMessage('');

    try {
      const today = new Date().toISOString().split('T')[0];
      console.log('Today:', today);
      
      const retrospectiveData = {
        user_id: user.id,
        date: today,
        type: templateType,
        content,
      };
      
      console.log('Retrospective Data:', retrospectiveData);

      const { error } = await supabase
        .from('retrospective_entries')
        .upsert(retrospectiveData, {
          onConflict: 'user_id,date,type',
          returning: 'minimal',
        });

      console.log('Supabase Response Error:', error);

      if (error) {
        console.error('Supabase Error Details:', error);
        setSavedMessage(`저장 중 오류가 발생했습니다: ${error.message}`);
      } else {
        console.log('저장 성공!');
        setSavedMessage('회고가 성공적으로 저장되었습니다!');
      }
    } catch (error) {
      console.error('Unexpected Error:', error);
      setSavedMessage(`예상치 못한 오류가 발생했습니다: ${error}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMessage(''), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">일일 회고 작성</h1>
        <p className="text-gray-600">
          오늘 하루를 돌아보며 성장을 위한 회고를 작성해보세요.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          오늘 날짜: {formatDate(new Date().toISOString())}
        </p>
      </div>

      {savedMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{savedMessage}</p>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>회고 템플릿 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={templateType === 'KPT' ? 'default' : 'outline'}
              onClick={() => setTemplateType('KPT')}
            >
              KPT 템플릿
            </Button>
            <Button
              variant={templateType === 'PMI' ? 'default' : 'outline'}
              onClick={() => setTemplateType('PMI')}
            >
              PMI 템플릿
            </Button>
            <Button
              variant={templateType === 'FREE' ? 'default' : 'outline'}
              onClick={() => setTemplateType('FREE')}
            >
              자유 작성
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {templateType === 'KPT' && (
              <p>
                <strong>KPT 템플릿:</strong> Keep (계속할 것), Problem (문제점), Try (시도할 것)으로 구성된 회고 방식입니다.
              </p>
            )}
            {templateType === 'PMI' && (
              <p>
                <strong>PMI 템플릿:</strong> Plus (좋았던 것), Minus (아쉬웠던 것), Interesting (흥미로웠던 것)으로 구성된 회고 방식입니다.
              </p>
            )}
            {templateType === 'FREE' && (
              <p>
                <strong>자유 작성:</strong> 형식에 구애받지 않고 오늘의 경험과 생각을 자유롭게 기록합니다.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {templateType === 'KPT' && (
        <KPTTemplate onSave={handleSave} saving={saving} />
      )}

      {templateType === 'PMI' && (
        <PMITemplate onSave={handleSave} saving={saving} />
      )}

      {templateType === 'FREE' && (
        <FreeTemplate onSave={handleSave} saving={saving} />
      )}
    </div>
  );
}