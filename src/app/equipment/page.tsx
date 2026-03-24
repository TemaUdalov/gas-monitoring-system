'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/badge';
import { Facility, FacilityStatus, FacilityType, FACILITY_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';

export default function EquipmentPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<FacilityType | ''>('');
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);
    fetch(`/api/facilities?${params}`).then((r) => r.json()).then(setFacilities).catch(() => {});
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  return (
    <div>
      <Header title="Оборудование" subtitle="Список объектов газотранспортной инфраструктуры" />
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input placeholder="Поиск по названию..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FacilityStatus | '')} className="w-full sm:w-48">
                <option value="">Все статусы</option>
                <option value="normal">Норма</option>
                <option value="warning">Предупреждение</option>
                <option value="critical">Авария</option>
              </Select>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FacilityType | '')} className="w-full sm:w-56">
                <option value="">Все типы</option>
                {Object.entries(FACILITY_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
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
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Название</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Тип</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Статус</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-500">Давление</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-500">Температура</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-500">Расход</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-500">Обновлено</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f) => (
                    <tr key={f.id} className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{f.id}</td>
                      <td className="px-4 py-3 font-medium">{f.name}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{FACILITY_TYPE_LABELS[f.type]}</td>
                      <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                      <td className="px-4 py-3 text-right tabular-nums">{f.pressure} МПа</td>
                      <td className="px-4 py-3 text-right tabular-nums">{f.temperature}°C</td>
                      <td className="px-4 py-3 text-right tabular-nums">{f.flowRate} м³/ч</td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-400">
                        {format(new Date(f.lastUpdated), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/equipment/${f.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                          Подробнее <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {facilities.length === 0 && <div className="py-12 text-center text-zinc-400">Объекты не найдены</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
