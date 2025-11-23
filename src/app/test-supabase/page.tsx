'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<{
    connected: boolean;
    message: string;
    error?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus(null);

    try {
      // 1. 환경 변수 확인
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setStatus({
          connected: false,
          message: '환경 변수가 설정되지 않았습니다.',
          error: 'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 없습니다.',
        });
        setTesting(false);
        return;
      }

      // 2. Supabase 연결 테스트 (더 간단한 방법)
      // profiles 대신 auth.users를 사용하거나, 더 간단한 테이블 사용
      const { data, error } = await supabase
        .from('contents')
        .select('id')
        .limit(1);

      if (error) {
        setStatus({
          connected: false,
          message: 'Supabase 연결 실패',
          error: error.message,
        });
      } else {
        setStatus({
          connected: true,
          message: 'Supabase 연결 성공!',
        });
      }
    } catch (err: any) {
      setStatus({
        connected: false,
        message: '연결 테스트 중 오류 발생',
        error: err.message || '알 수 없는 오류',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Supabase 연결 테스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Supabase 연결 상태를 확인합니다.
              </p>
              <Button
                onClick={testConnection}
                disabled={testing}
                className="w-full"
              >
                {testing ? '테스트 중...' : '연결 테스트'}
              </Button>
            </div>

            {status && (
              <div
                className={`p-4 rounded-lg ${
                  status.connected
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}
              >
                <h3
                  className={`font-semibold mb-2 ${
                    status.connected
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}
                >
                  {status.connected ? '✅ 성공' : '❌ 실패'}
                </h3>
                <p
                  className={`text-sm ${
                    status.connected
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {status.message}
                </p>
                {status.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    {status.error}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold">환경 변수 확인:</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono">
                <div>
                  URL:{' '}
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? '✅ 설정됨'
                    : '❌ 없음'}
                </div>
                <div>
                  KEY:{' '}
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? '✅ 설정됨'
                    : '❌ 없음'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

