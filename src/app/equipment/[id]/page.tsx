'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { ParameterChart } from '@/components/charts/parameter-chart';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FACILITY_TYPE_LABELS, TimePeriod, Facility, SensorReading, Alert, FacilityStatus } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, MapPin, Gauge, Thermometer, Wind, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

function evaluateStatus(pressure: number, temperature: number): FacilityStatus {
  if (pressure < 5.0 || temperature > 55) return 'critical';
  if (pressure < 5.5 || temperature > 50) return 'warning';
  return 'normal';
}

export default function FacilityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [facility, setFacility] = useState<Facility | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/facilities?id=${id}`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/alerts?facilityId=${id}`).then((r) => r.json()),
    ]).then(([f, a]) => {
      setFacility(f);
      setAlerts(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetch(`/api/facilities?id=${id}&readings=true&period=${period}`)
      .then((r) => r.json())
      .then(setReadings)
      .catch(() => {});
  }, [id, period]);

  if (loading) {
    return (
      <div>
        <Header title="Загрузка..." />
        <div className="p-6 text-center text-zinc-400">Загрузка данных объекта...</div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div>
        <Header title="Объект не найден" />
        <div className="p-6">
          <Link href="/equipment"><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Вернуться к списку</Button></Link>
        </div>
      </div>
    );
  }

  const computedStatus = evaluateStatus(facility.pressure, facility.temperature);

  const statusMessage =
    facility.status === 'critical'
      ? 'Объект находится в аварийном состоянии. Требуется немедленное вмешательство оперативного персонала. Зафиксированы критические отклонения параметров от нормы.'
      : facility.status === 'warning'
      ? 'Объект работает с отклонениями. Рекомендуется провести диагностику и плановое обслуживание в ближайшее время.'
      : 'Объект работает в штатном режиме. Все параметры в пределах нормы. Плановое обслуживание по графику.';

  return (
    <div>
      <Header title={facility.name} subtitle={FACILITY_TYPE_LABELS[facility.type]} />
      <div className="p-6 space-y-6">
        <Link href="/equipment"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> К списку объектов</Button></Link>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50"><Gauge className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Давление</p><p className="text-xl font-bold tabular-nums">{facility.pressure} <span className="text-sm font-normal text-zinc-400">МПа</span></p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50"><Thermometer className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Температура</p><p className="text-xl font-bold tabular-nums">{facility.temperature} <span className="text-sm font-normal text-zinc-400">°C</span></p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50"><Wind className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Расход</p><p className="text-xl font-bold tabular-nums">{facility.flowRate} <span className="text-sm font-normal text-zinc-400">м³/ч</span></p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600 dark:bg-zinc-800"><Clock className="h-5 w-5" /></div><div><p className="text-xs text-zinc-500">Обновлено</p><p className="text-sm font-medium">{format(new Date(facility.lastUpdated), 'dd.MM.yyyy HH:mm', { locale: ru })}</p></div></div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Основные сведения</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-zinc-500">Идентификатор</dt><dd className="font-mono text-sm">{facility.id}</dd></div>
                <div><dt className="text-sm text-zinc-500">Тип объекта</dt><dd className="text-sm">{FACILITY_TYPE_LABELS[facility.type]}</dd></div>
                <div><dt className="text-sm text-zinc-500">Расположение</dt><dd className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-400" />{facility.location.label}</dd></div>
                <div><dt className="text-sm text-zinc-500">Статус</dt><dd><StatusBadge status={facility.status} /></dd></div>
                <div className="sm:col-span-2"><dt className="text-sm text-zinc-500">Описание</dt><dd className="text-sm mt-1">{facility.description}</dd></div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Заключение</CardTitle><CardDescription>Автоматическая оценка состояния</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-3"><StatusBadge status={computedStatus} /></div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{statusMessage}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>История параметров</CardTitle>
              <Select value={period} onChange={(e) => setPeriod(e.target.value as TimePeriod)} className="w-36">
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ParameterChart data={readings} showPressure showTemperature showFlowRate height={350} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>События и предупреждения</CardTitle></CardHeader>
          <CardContent><AlertsList alerts={alerts} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
