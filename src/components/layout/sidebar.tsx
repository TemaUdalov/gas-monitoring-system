'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Factory,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Flame,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Обзор', href: '/', icon: LayoutDashboard },
  { name: 'Оборудование', href: '/equipment', icon: Factory },
  { name: 'Аналитика', href: '/analytics', icon: BarChart3 },
  { name: 'Аварии', href: '/incidents', icon: AlertTriangle },
  { name: 'Отчёты', href: '/reports', icon: FileText },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('Оператор');
  const [userInitials, setUserInitials] = useState('ОП');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.fullName) {
          setUserName(data.fullName);
          const parts = data.fullName.split(' ');
          setUserInitials(parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">ГазМониторинг</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-600 dark:text-blue-400' : '')} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Диспетчерский пункт</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
            title="Выйти из системы"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
