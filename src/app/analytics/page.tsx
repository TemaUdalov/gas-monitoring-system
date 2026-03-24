'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ParameterChart } from '@/components/charts/parameter-chart';
import { StatusPieChart } from '@/components/charts/status-pie-chart';
import { Facility, SensorReading, TimePeriod } from '@/types';

export default function AnalyticsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [chartData, setChartData] = useState<SensorReading[]>([]);
  const [statusData, setStatusData] = useState<{ status: string; count: number; color: string }[]>([]);

  useEffect(() => {
    fetch('/api/facilities').then((r) => r.json()).then(setFacilities).catch(() => {});
    fetch('/api/analytics').then((r) => r.json()).then(setStatusData).catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ period });
    if (selectedFacility !== 'all') params.set('facilityId', selectedFacility);
    fetch(`/api/readings?${params}`).then((r) => r.json()).then(setChartData).catch(() => {});
  }, [selectedFacility, period]);

  return (
    <div>
      <Header title="Аналитика" subtitle="Анализ параметров и состояния объектов" />
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Select value={selectedFacility} onChange={(e) => setSelectedFacility(e.target.value)} className="flex-1">
                <option value="all">Все объекты (среднее)</option>
                {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
              <Select value={period} onChange={(e) => setPeriod(e.target.value as TimePeriod)} className="w-full sm:w-40">
                <option value="day">День</option>
                <option value="week">Неделя</option>
                <option value="month">Месяц</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Давление</CardTitle></CardHeader><CardContent><ParameterChart data={chartData} showPressure showTemperature={false} height={300} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Температура</CardTitle></CardHeader><CardContent><ParameterChart data={chartData} showPressure={false} showTemperature height={300} /></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Расход газа</CardTitle></CardHeader><CardContent><ParameterChart data={chartData} showPressure={false} showTemperature={false} showFlowRate height={300} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Распределение объектов по статусам</CardTitle></CardHeader><CardContent><StatusPieChart data={statusData} height={300} /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
