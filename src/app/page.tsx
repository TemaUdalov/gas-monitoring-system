import { Header } from '@/components/layout/header';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { NetworkMap } from '@/components/dashboard/network-map';
import { ParameterChartWrapper } from '@/components/charts/parameter-chart-wrapper';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { FacilitiesTable } from '@/components/dashboard/facilities-table';
import { getDashboardMetrics, getFacilities, getAlerts, getAggregatedReadings } from '@/services/monitoring';
import { Factory, AlertTriangle, Thermometer, Gauge } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [metrics, facilities, recentAlerts, chartData] = await Promise.all([
    getDashboardMetrics(),
    getFacilities(),
    getAlerts().then((a) => a.filter((x) => x.status !== 'resolved').slice(0, 5)),
    getAggregatedReadings('week'),
  ]);

  return (
    <div>
      <Header
        title="Информационная система мониторинга газотранспортной сети"
        subtitle="Обзор текущего состояния объектов и параметров"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Активные объекты" value={metrics.activeFacilities} icon={<Factory className="h-5 w-5" />} variant="default" />
          <MetricCard title="Аварийные события" value={metrics.criticalAlerts} icon={<AlertTriangle className="h-5 w-5" />} variant="danger" />
          <MetricCard title="Средняя температура" value={metrics.avgTemperature} unit="°C" icon={<Thermometer className="h-5 w-5" />} variant="warning" />
          <MetricCard title="Давление в сети" value={metrics.avgPressure} unit="МПа" icon={<Gauge className="h-5 w-5" />} variant="success" />
        </div>

        <Card>
          <CardHeader><CardTitle>Карта объектов</CardTitle></CardHeader>
          <CardContent>
            <NetworkMap facilities={facilities} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>График параметров</CardTitle></CardHeader>
            <CardContent>
              <ParameterChartWrapper data={chartData} height={320} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Предупреждения</CardTitle></CardHeader>
            <CardContent>
              <AlertsList alerts={recentAlerts} compact />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Состояние объектов</CardTitle></CardHeader>
          <CardContent>
            <FacilitiesTable facilities={facilities} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
