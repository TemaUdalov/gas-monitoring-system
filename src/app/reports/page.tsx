'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Report, DashboardMetrics, Facility, Alert } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { FileText, Download, Printer, Plus, Calendar, AlertTriangle, Factory, Gauge } from 'lucide-react';

const typeLabels: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'danger' }> = {
  daily: { label: 'Ежедневный', variant: 'default' },
  weekly: { label: 'Еженедельный', variant: 'info' },
  monthly: { label: 'Ежемесячный', variant: 'info' },
  incident: { label: 'Инцидент', variant: 'danger' },
};

function GeneratedReport() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [criticalFacilities, setCritical] = useState<Facility[]>([]);
  const [warningFacilities, setWarning] = useState<Facility[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/facilities?metrics=true').then((r) => r.json()),
      fetch('/api/facilities?status=critical').then((r) => r.json()),
      fetch('/api/facilities?status=warning').then((r) => r.json()),
      fetch('/api/alerts?status=active').then((r) => r.json()),
    ]).then(([m, c, w, a]) => {
      setMetrics(m);
      setCritical(c);
      setWarning(w);
      setActiveAlerts(a);
    }).catch(() => {});
  }, []);

  if (!metrics) return <div className="text-center text-zinc-400 py-4">Загрузка данных...</div>;

  return (
    <div className="print:p-8" id="generated-report">
      <div className="mb-6 border-b pb-4 dark:border-zinc-800">
        <h2 className="text-xl font-bold">Сводный отчёт о состоянии газотранспортной сети</h2>
        <p className="text-sm text-zinc-500 mt-1">Дата формирования: {new Date().toLocaleString('ru-RU')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1"><Factory className="h-4 w-4" /> Активные объекты</div>
          <p className="text-2xl font-bold">{metrics.activeFacilities}</p>
        </div>
        <div className="border rounded-lg p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1"><AlertTriangle className="h-4 w-4" /> Аварийные события</div>
          <p className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</p>
        </div>
        <div className="border rounded-lg p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1"><Gauge className="h-4 w-4" /> Среднее давление</div>
          <p className="text-2xl font-bold">{metrics.avgPressure} МПа</p>
        </div>
        <div className="border rounded-lg p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1"><Calendar className="h-4 w-4" /> Средняя температура</div>
          <p className="text-2xl font-bold">{metrics.avgTemperature}°C</p>
        </div>
      </div>

      {criticalFacilities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Аварийные объекты</h3>
          <ul className="space-y-1 text-sm">
            {criticalFacilities.map((f) => (
              <li key={f.id} className="flex justify-between border-b border-red-100 dark:border-red-900/50 py-1">
                <span className="font-medium">{f.name}</span>
                <span className="text-zinc-500">P: {f.pressure} МПа, T: {f.temperature}°C</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {warningFacilities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">Объекты с предупреждениями</h3>
          <ul className="space-y-1 text-sm">
            {warningFacilities.map((f) => (
              <li key={f.id} className="flex justify-between border-b border-amber-100 dark:border-amber-900/50 py-1">
                <span className="font-medium">{f.name}</span>
                <span className="text-zinc-500">P: {f.pressure} МПа, T: {f.temperature}°C</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Активные предупреждения</h3>
          <ul className="space-y-2 text-sm">
            {activeAlerts.map((a) => (
              <li key={a.id} className="border rounded-lg p-2 dark:border-zinc-800">
                <div className="font-medium">{a.title}</div>
                <div className="text-zinc-500">{a.facilityName} — {a.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t pt-4 mt-6 text-xs text-zinc-400 dark:border-zinc-800">
        Отчёт сгенерирован автоматически информационной системой «ГазМониторинг» v1.0
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [showGenerated, setShowGenerated] = useState(false);

  useEffect(() => {
    fetch('/api/reports').then((r) => r.json()).then(setReports).catch(() => {});
  }, []);

  const handleDownloadGenerated = () => {
    window.open('/api/reports/download', '_blank');
  };

  const handleDownloadReport = (reportId: string) => {
    window.open(`/api/reports/download?id=${reportId}`, '_blank');
  };

  return (
    <div>
      <Header title="Отчёты" subtitle="Формирование и просмотр отчётов" />
      <div className="p-6 space-y-6">
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => setShowGenerated(!showGenerated)}>
            <Plus className="h-4 w-4" />
            {showGenerated ? 'Скрыть отчёт' : 'Сформировать отчёт'}
          </Button>
          {showGenerated && (
            <>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> Печать
              </Button>
              <Button variant="outline" onClick={handleDownloadGenerated}>
                <Download className="h-4 w-4" /> Скачать HTML
              </Button>
            </>
          )}
        </div>

        {showGenerated && (
          <Card>
            <CardContent className="p-6">
              <GeneratedReport />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Архив отчётов</CardTitle>
            <CardDescription>Сформированные ранее отчёты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.map((report) => {
                const typeInfo = typeLabels[report.type] || typeLabels.daily;
                return (
                  <div key={report.id} className="flex items-start gap-4 rounded-lg border p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-500 dark:bg-zinc-800">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{report.title}</span>
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{report.summary}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                        <span>Период: {report.period}</span>
                        <span>·</span>
                        <span>Создан: {format(new Date(report.createdAt), 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => handleDownloadReport(report.id)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
