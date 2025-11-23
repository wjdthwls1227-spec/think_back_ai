'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RetrospectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/app/retrospect');
    } else if (!loading && user) {
      // 기본적으로 회고 작성 페이지로 리다이렉트
      router.push('/app/journal');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 animate-spin border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return null;
}

