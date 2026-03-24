import { prisma } from '@/lib/prisma';
import { DashboardMetrics, Facility, FacilityStatus, FacilityType, Alert, AlertSeverity, AlertStatus, TimePeriod, SensorReading, Report } from '@/types';
import type { Facility as PrismaFacility, Alert as PrismaAlert, SensorReading as PrismaSensorReading, Report as PrismaReport } from '@/generated/prisma/client';

const PRESSURE_THRESHOLDS = { low: 5.0, high: 10.0 };
const TEMPERATURE_THRESHOLD = 50;

export function evaluateStatus(pressure: number, temperature: number): FacilityStatus {
  if (pressure < PRESSURE_THRESHOLDS.low || temperature > TEMPERATURE_THRESHOLD + 5) return 'critical';
  if (pressure < PRESSURE_THRESHOLDS.low + 0.5 || temperature > TEMPERATURE_THRESHOLD) return 'warning';
  return 'normal';
}

function mapFacility(f: PrismaFacility): Facility {
  return {
    id: f.id,
    name: f.name,
    type: f.type as FacilityType,
    location: { lat: f.locationLat, lng: f.locationLng, label: f.locationLabel },
    status: f.status as FacilityStatus,
    pressure: f.pressure,
    temperature: f.temperature,
    flowRate: f.flowRate,
    lastUpdated: f.lastUpdated.toISOString(),
    description: f.description,
  };
}

function mapAlert(a: PrismaAlert): Alert {
  return {
    id: a.id,
    facilityId: a.facilityId,
    facilityName: a.facilityName,
    title: a.title,
    description: a.description,
    severity: a.severity as AlertSeverity,
    status: a.status as AlertStatus,
    createdAt: a.createdAt.toISOString(),
    isRead: a.isRead,
  };
}

function mapReading(r: PrismaSensorReading): SensorReading {
  return {
    id: r.id,
    facilityId: r.facilityId,
    timestamp: r.timestamp.toISOString(),
    pressure: r.pressure,
    temperature: r.temperature,
    flowRate: r.flowRate,
  };
}

function mapReport(r: PrismaReport): Report {
  return {
    id: r.id,
    title: r.title,
    period: r.period,
    summary: r.summary,
    type: r.type as Report['type'],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [activeFacilities, criticalAlerts, tempResult, pressureResult] = await Promise.all([
    prisma.facility.count(),
    prisma.alert.count({ where: { severity: 'critical', status: { not: 'resolved' } } }),
    prisma.facility.aggregate({ _avg: { temperature: true } }),
    prisma.facility.aggregate({ _avg: { pressure: true } }),
  ]);

  return {
    activeFacilities,
    criticalAlerts,
    avgTemperature: Math.round((tempResult._avg.temperature ?? 0) * 10) / 10,
    avgPressure: Math.round((pressureResult._avg.pressure ?? 0) * 100) / 100,
  };
}

export async function getFacilities(filters?: {
  search?: string;
  status?: FacilityStatus;
  type?: FacilityType;
}): Promise<Facility[]> {
  const where: Record<string, unknown> = {};

  if (filters?.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.type) {
    where.type = filters.type;
  }

  const results = await prisma.facility.findMany({ where, orderBy: { name: 'asc' } });
  return results.map(mapFacility);
}

export async function getFacilityById(id: string): Promise<Facility | null> {
  const f = await prisma.facility.findUnique({ where: { id } });
  return f ? mapFacility(f) : null;
}

export async function getFacilityReadings(facilityId: string, period: TimePeriod = 'week'): Promise<SensorReading[]> {
  const hoursBack = period === 'day' ? 24 : period === 'week' ? 168 : 720;
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const results = await prisma.sensorReading.findMany({
    where: { facilityId, timestamp: { gte: cutoff } },
    orderBy: { timestamp: 'asc' },
  });
  return results.map(mapReading);
}

export async function getAggregatedReadings(period: TimePeriod = 'week'): Promise<SensorReading[]> {
  const hoursBack = period === 'day' ? 24 : period === 'week' ? 168 : 720;
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const results = await prisma.sensorReading.findMany({
    where: { timestamp: { gte: cutoff } },
    orderBy: { timestamp: 'asc' },
  });

  const byTimestamp = new Map<string, { pressure: number[]; temperature: number[]; flowRate: number[] }>();
  for (const r of results) {
    const key = r.timestamp.toISOString();
    if (!byTimestamp.has(key)) {
      byTimestamp.set(key, { pressure: [], temperature: [], flowRate: [] });
    }
    const group = byTimestamp.get(key)!;
    group.pressure.push(r.pressure);
    group.temperature.push(r.temperature);
    group.flowRate.push(r.flowRate);
  }

  const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 100) / 100;

  return Array.from(byTimestamp.entries()).map(([timestamp, group]) => ({
    id: `agg-${timestamp}`,
    facilityId: 'all',
    timestamp,
    pressure: avg(group.pressure),
    temperature: avg(group.temperature),
    flowRate: avg(group.flowRate),
  }));
}

export async function getAlerts(filters?: {
  severity?: AlertSeverity;
  status?: AlertStatus;
  search?: string;
}): Promise<Alert[]> {
  const where: Record<string, unknown> = {};

  if (filters?.severity) where.severity = filters.severity;
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { facilityName: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const results = await prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
  return results.map(mapAlert);
}

export async function getAlertsForFacility(facilityId: string): Promise<Alert[]> {
  const results = await prisma.alert.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
  });
  return results.map(mapAlert);
}

export async function getUnreadAlertCount(): Promise<number> {
  return prisma.alert.count({ where: { isRead: false } });
}

export async function markAlertRead(alertId: string): Promise<void> {
  await prisma.alert.update({ where: { id: alertId }, data: { isRead: true } });
}

export async function markAllAlertsRead(): Promise<void> {
  await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
}

export async function getReports(): Promise<Report[]> {
  const results = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
  return results.map(mapReport);
}

export async function getStatusDistribution(): Promise<{ status: string; count: number; color: string }[]> {
  const [normal, warning, critical] = await Promise.all([
    prisma.facility.count({ where: { status: 'normal' } }),
    prisma.facility.count({ where: { status: 'warning' } }),
    prisma.facility.count({ where: { status: 'critical' } }),
  ]);

  return [
    { status: 'Норма', count: normal, color: '#22c55e' },
    { status: 'Предупреждение', count: warning, color: '#f59e0b' },
    { status: 'Авария', count: critical, color: '#ef4444' },
  ];
}

export async function globalSearch(query: string): Promise<{
  facilities: Facility[];
  alerts: Alert[];
}> {
  const [facilities, alerts] = await Promise.all([
    prisma.facility.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 5,
    }),
    prisma.alert.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { facilityName: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    facilities: facilities.map(mapFacility),
    alerts: alerts.map(mapAlert),
  };
}
