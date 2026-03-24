'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SeverityBadge, AlertStatusBadge } from '@/components/ui/badge';
import { Alert, AlertSeverity, AlertStatus } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Search, AlertTriangle } from 'lucide-react';

export default function IncidentsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>('');
  const [incidents, setIncidents] = useState<Alert[]>([]);

  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (severityFilter) params.set('severity', severityFilter);
    if (statusFilter) params.set('status', statusFilter);
    fetch(`/api/alerts?${params}`).then((r) => r.json()).then(setIncidents).catch(() => {});
  }, [search, severityFilter, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  return (
    <div>
      <Header title="Аварии и инциденты" subtitle="Журнал событий и предупреждений" />
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input placeholder="Поиск по событиям..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | '')} className="w-full sm:w-48">
                <option value="">Все уровни</option>
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as AlertStatus | '')} className="w-full sm:w-48">
                <option value="">Все статусы</option>
                <option value="active">Активно</option>
                <option value="acknowledged">Принято</option>
                <option value="resolved">Устранено</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Дата и время</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Объект</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Событие</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Критичность</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Статус</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((alert) => (
                    <tr key={alert.id} className={`border-b transition-colors ${
                      alert.severity === 'critical' && alert.status === 'active'
                        ? 'bg-red-50/60 border-red-100 hover:bg-red-50 dark:bg-red-950/20 dark:border-red-900/50'
                        : 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50'
                    }`}>
                      <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{format(new Date(alert.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}</td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{alert.facilityName}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                          <span className="font-medium">{alert.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><SeverityBadge severity={alert.severity} /></td>
                      <td className="px-4 py-3"><AlertStatusBadge status={alert.status} /></td>
                      <td className="px-4 py-3 text-xs text-zinc-500 max-w-xs truncate">{alert.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {incidents.length === 0 && <div className="py-12 text-center text-zinc-400">Событий не найдено</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
