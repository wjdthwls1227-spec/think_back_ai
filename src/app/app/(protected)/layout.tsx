import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Card } from '@/components/ui/card';
import { FileText, BookOpen, User, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=' + encodeURIComponent('/app'));
  }

  // 프로필 정보 가져오기
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 앱 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/app/dashboard" className="flex items-center">
                <Home className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="font-semibold text-gray-900 dark:text-white">앱</span>
              </Link>
              <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto">
                <NavLink href="/app/dashboard" icon={Home} label="대시보드" />
                <NavLink href="/app/journal" icon={FileText} label="회고 작성" />
                <NavLink href="/app/contents" icon={BookOpen} label="내 콘텐츠" />
                <NavLink href="/app/mypage" icon={User} label="마이페이지" />
                {isAdmin && (
                  <NavLink href="/app/admin/contents" icon={Shield} label="관리자" />
                )}
              </nav>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {profile?.display_name || profile?.email || user.email}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
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
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap',
        'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
        'dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700',
        'transition-colors'
      )}
    >
      <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
      {label}
    </Link>
  );
}

