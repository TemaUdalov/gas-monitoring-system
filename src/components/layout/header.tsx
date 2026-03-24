'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { SeverityBadge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Alert, AlertSeverity, Facility } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function LiveClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">{time}</div>;
}

function SearchPopover() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ facilities: Facility[]; alerts: Alert[] }>({ facilities: [], alerts: [] });
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ facilities: [], alerts: [] });
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setResults)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const hasResults = results.facilities.length > 0 || results.alerts.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50">
          <div className="flex items-center gap-2 p-3 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск объектов и событий..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <div className="p-4 text-center text-sm text-zinc-400">Поиск...</div>}

            {!loading && query.length >= 2 && !hasResults && (
              <div className="p-4 text-center text-sm text-zinc-400">Ничего не найдено</div>
            )}

            {results.facilities.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-zinc-400 uppercase">Объекты</p>
                {results.facilities.map((f) => (
                  <Link
                    key={f.id}
                    href={`/equipment/${f.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className={`h-2 w-2 rounded-full ${
                      f.status === 'critical' ? 'bg-red-500' : f.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <span className="font-medium">{f.name}</span>
                    <span className="text-xs text-zinc-400 ml-auto">{f.pressure} МПа</span>
                  </Link>
                ))}
              </div>
            )}

            {results.alerts.length > 0 && (
              <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                <p className="px-2 py-1 text-xs font-medium text-zinc-400 uppercase">События</p>
                {results.alerts.map((a) => (
                  <Link
                    key={a.id}
                    href="/incidents"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="font-medium truncate">{a.title}</span>
                    <span className="text-xs text-zinc-400 ml-auto flex-shrink-0">{a.facilityName}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  facilityName: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.alerts || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (alertId: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId }),
    });
    fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    fetchNotifications();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-sm font-semibold">Уведомления</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="p-6 text-center text-sm text-zinc-400">Нет уведомлений</div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 p-3 border-b border-zinc-50 dark:border-zinc-800/50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                  !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div className="mt-0.5">
                  {!n.isRead && <span className="block h-2 w-2 rounded-full bg-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{n.title}</span>
                    <SeverityBadge severity={n.severity as AlertSeverity} />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">{n.facilityName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <SearchPopover />
        <NotificationsPopover />
        <LiveClock />
      </div>
    </header>
  );
}
