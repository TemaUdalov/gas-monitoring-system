'use client';

import { Facility, FACILITY_TYPE_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface FacilitiesTableProps {
  facilities: Facility[];
  compact?: boolean;
}

export function FacilitiesTable({ facilities, compact = false }: FacilitiesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Объект</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Тип</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Статус</th>
            {!compact && (
              <>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Давление</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Температура</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Расход</th>
              </>
            )}
            <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Обновлено</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {facilities.map((f) => (
            <tr
              key={f.id}
              className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <td className="px-4 py-3 font-medium">{f.name}</td>
              <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{FACILITY_TYPE_LABELS[f.type]}</td>
              <td className="px-4 py-3">
                <StatusBadge status={f.status} />
              </td>
              {!compact && (
                <>
                  <td className="px-4 py-3 text-right tabular-nums">{f.pressure} МПа</td>
                  <td className="px-4 py-3 text-right tabular-nums">{f.temperature}°C</td>
                  <td className="px-4 py-3 text-right tabular-nums">{f.flowRate} м³/ч</td>
                </>
              )}
              <td className="px-4 py-3 text-right text-zinc-400 text-xs">
                {format(new Date(f.lastUpdated), 'HH:mm', { locale: ru })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/equipment/${f.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
