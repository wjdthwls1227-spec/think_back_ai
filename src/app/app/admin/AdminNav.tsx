'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
        <AdminNavLink 
          href="/app/admin/contents" 
          icon={BookOpen} 
          label="콘텐츠 관리"
          isActive={pathname.startsWith('/app/admin/contents')}
        />
        <AdminNavLink 
          href="/app/admin/community-cases" 
          icon={Users2} 
          label="커뮤니티 사례 관리"
          isActive={pathname.startsWith('/app/admin/community-cases')}
        />
        <AdminNavLink 
          href="/app/admin/retrospect-tools" 
          icon={Wrench} 
          label="회고 도구 관리"
          isActive={pathname.startsWith('/app/admin/retrospect-tools')}
        />
      </nav>
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
        'inline-flex items-center px-2 sm:px-4 py-2 border-b-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
        isActive
          ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
          : 'text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
      )}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
      {label}
    </Link>
  );
}

