'use client';

import { Alert } from '@/types';
import { SeverityBadge, AlertStatusBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  compact?: boolean;
}

export function AlertsList({ alerts, compact = false }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="text-sm">Нет предупреждений</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
            alert.severity === 'critical'
              ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
              : alert.severity === 'high'
              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20'
              : 'border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <div className="mt-0.5">
            <AlertTriangle
              className={`h-4 w-4 ${
                alert.severity === 'critical'
                  ? 'text-red-500'
                  : alert.severity === 'high'
                  ? 'text-amber-500'
                  : 'text-zinc-400'
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{alert.title}</span>
              <SeverityBadge severity={alert.severity} />
              <AlertStatusBadge status={alert.status} />
            </div>
            {!compact && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {alert.description}
              </p>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
              <span>{alert.facilityName}</span>
              <span>·</span>
              <span>{format(new Date(alert.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
