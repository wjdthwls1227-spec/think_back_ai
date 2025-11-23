'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FileText, History, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TabType = 'write' | 'history' | 'reports';

const tabs = [
  {
    id: 'write' as TabType,
    label: '회고 작성',
    icon: FileText,
    href: '/app/journal',
  },
  {
    id: 'history' as TabType,
    label: '회고 히스토리',
    icon: History,
    href: '/history',
  },
  {
    id: 'reports' as TabType,
    label: '리포트',
    icon: BarChart3,
    href: '/reports',
  },
];

export function RetrospectLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 현재 경로에 따라 활성 탭 결정
  const getActiveTab = (): TabType => {
    if (pathname.includes('/journal')) return 'write';
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/reports')) return 'reports';
    return 'write';
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => router.push(tab.href)}
                    className={cn(
                      'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-2 h-5 w-5',
                        isActive
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}

