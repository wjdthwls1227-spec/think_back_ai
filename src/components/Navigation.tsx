'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, History, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    href: '/retrospective',
    label: '회고 작성',
    icon: FileText,
  },
  {
    href: '/history',
    label: '회고 히스토리',
    icon: History,
  },
  {
    href: '/reports',
    label: '주간 리포트',
    icon: BarChart3,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center px-4 text-lg font-semibold text-gray-900">
              회고리즘
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      pathname.startsWith('/admin')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    관리자
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <UserProfile />
            ) : (
              pathname !== '/login' && (
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}