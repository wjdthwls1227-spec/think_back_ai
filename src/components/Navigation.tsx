'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FileText, History, BarChart3, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

// 로그인 후 네비게이션
const loggedInNavItems = [
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

// 공개 영역 네비게이션
const publicNavItems = [
  {
    href: '/#about',
    label: '서비스 소개',
  },
  {
    href: '/contents',
    label: '콘텐츠',
  },
  {
    href: '/cases',
    label: '회고 칼럼',
  },
  {
    href: '/pricing',
    label: '플랜',
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex flex-col items-start px-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              <span>ThinkBack AI</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">회고리즘</span>
            </Link>
            {/* 데스크톱 메뉴 */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* 공개 영역 네비게이션 (로그인 여부와 관계없이 항상 표시) */}
              {publicNavItems.map((item) => {
                const isActive = 
                  pathname === item.href || 
                  (item.href.startsWith('/#') && pathname === '/') ||
                  (item.href === '/cases' && pathname.startsWith('/cases'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                      isActive
                        ? 'border-blue-500 text-gray-900 dark:text-gray-100 dark:border-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {/* 관리자 링크 (로그인 + admin일 때만) */}
              {user && isAdmin && (
                <Link
                  href="/app/admin/contents"
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    pathname.startsWith('/app/admin')
                      ? 'border-blue-500 text-gray-900 dark:text-gray-100 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  )}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  관리자
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            ) : user ? (
              <>
                <Link href="/app/retrospect" className="hidden sm:block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    회고하기
                  </Button>
                </Link>
                <UserProfile />
              </>
            ) : (
              pathname !== '/login' && (
                <Link href="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm">
                    로그인
                  </Button>
                </Link>
              )
            )}
            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              aria-label="메뉴 열기"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {publicNavItems.map((item) => {
                const isActive = 
                  pathname === item.href || 
                  (item.href.startsWith('/#') && pathname === '/') ||
                  (item.href === '/cases' && pathname.startsWith('/cases'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2 rounded-md text-base font-medium',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {user && isAdmin && (
                <Link
                  href="/app/admin/contents"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium',
                    pathname.startsWith('/app/admin')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  )}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  관리자
                </Link>
              )}
              {!user && pathname !== '/login' && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  로그인
                </Link>
              )}
              {user && (
                <Link
                  href="/app/retrospect"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  회고하기
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}