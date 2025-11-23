'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, BookOpen, User, Home, Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  isAdmin: boolean;
  userEmail: string;
  displayName?: string | null;
}

const navItems = [
  { href: '/app/dashboard', icon: Home, label: '대시보드' },
  { href: '/app/journal', icon: FileText, label: '회고 작성' },
  { href: '/app/contents', icon: BookOpen, label: '내 콘텐츠' },
  { href: '/app/mypage', icon: User, label: '마이페이지' },
];

export function AppHeader({ isAdmin, userEmail, displayName }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/app/dashboard" className="flex items-center">
              <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="font-semibold text-gray-900 dark:text-white">앱</span>
            </Link>
            {/* 데스크톱 메뉴 */}
            <nav className="hidden md:flex md:ml-8 md:space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
              ))}
              {isAdmin && (
                <NavLink href="/app/admin/contents" icon={Shield} label="관리자" />
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
              {displayName || userEmail}
            </div>
            {/* 모바일 햄버거 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
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
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
              {isAdmin && (
                <MobileNavLink
                  href="/app/admin/contents"
                  icon={Shield}
                  label="관리자"
                  isActive={pathname.startsWith('/app/admin')}
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavLink({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/app/dashboard' && pathname.startsWith(href));
  
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  onClick
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'block px-3 py-2 rounded-md text-base font-medium',
        isActive
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
      )}
    >
      <Icon className="w-4 h-4 inline mr-2" />
      {label}
    </Link>
  );
}

