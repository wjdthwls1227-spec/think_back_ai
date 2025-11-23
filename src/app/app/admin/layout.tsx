'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log('AdminLayout - Client check:', {
      user: user?.email,
      isAdmin,
      loading
    });

    if (!loading) {
      if (!user) {
        console.log('AdminLayout - No user, redirecting to login');
        router.push('/login');
        return;
      }

      if (!isAdmin) {
        console.log('AdminLayout - Not admin, redirecting to dashboard');
        router.push('/app/dashboard');
        return;
      }

      console.log('AdminLayout - Admin confirmed');
      setChecking(false);
    }
  }, [user, isAdmin, loading, router]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

