'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users2, Wrench, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/app/admin/contents', icon: BookOpen, label: '콘텐츠 관리' },
  { href: '/app/admin/community-cases', icon: Users2, label: '커뮤니티 사례 관리' },
  { href: '/app/admin/retrospect-tools', icon: Wrench, label: '회고 도구 관리' },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      {/* 데스크톱 메뉴 */}
      <nav className="hidden sm:flex sm:space-x-4">
        {adminNavItems.map((item) => (
          <AdminNavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={pathname.startsWith(item.href)}
          />
        ))}
      </nav>
      {/* 모바일 메뉴 */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          aria-label="관리자 메뉴 열기"
        >
          <Menu className="w-5 h-5 mr-2" />
          <span>관리자 메뉴</span>
          {mobileMenuOpen ? (
            <X className="w-4 h-4 ml-auto" />
          ) : null}
        </button>
        {mobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            {adminNavItems.map((item) => (
              <AdminMobileNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname.startsWith(item.href)}
                onClick={() => setMobileMenuOpen(false)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminNavLink({ 
  href, 
  icon: Icon, 
  label,
  isActive
}: { 
  href: string; 
  icon: React.ComponentType<{ className?: string }>; 
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors',
        isActive
          ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
          : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
      )}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Link>
  );
}

function AdminMobileNavLink({
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

