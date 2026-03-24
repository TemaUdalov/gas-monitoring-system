import { SensorReading } from '@/types';
import { facilities } from './facilities';

function generateReadings(facilityId: string, basePressure: number, baseTemp: number, baseFlow: number): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = new Date('2026-03-24T08:00:00Z');

  for (let i = 30 * 24; i >= 0; i -= 4) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const noise = () => (Math.random() - 0.5) * 2;
    const trend = Math.sin(i / 24 * Math.PI / 7) * 0.3;

    readings.push({
      id: `r-${facilityId}-${i}`,
      facilityId,
      timestamp: timestamp.toISOString(),
      pressure: Math.round((basePressure + noise() * 0.5 + trend) * 100) / 100,
      temperature: Math.round((baseTemp + noise() * 3 + Math.sin(i / 12) * 2) * 10) / 10,
      flowRate: Math.round(baseFlow + noise() * 50 + trend * 30),
    });
  }
  return readings;
}

export const allReadings: SensorReading[] = facilities.flatMap((f) =>
  generateReadings(f.id, f.pressure, f.temperature, f.flowRate)
);

export function getReadingsForFacility(facilityId: string, period: 'day' | 'week' | 'month' = 'week'): SensorReading[] {
  const now = new Date('2026-03-24T08:00:00Z');
  const hoursBack = period === 'day' ? 24 : period === 'week' ? 168 : 720;
  const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

  return allReadings
    .filter((r) => r.facilityId === facilityId && new Date(r.timestamp) >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getLatestReadings(period: 'day' | 'week' | 'month' = 'week'): SensorReading[] {
  const now = new Date('2026-03-24T08:00:00Z');
  const hoursBack = period === 'day' ? 24 : period === 'week' ? 168 : 720;
  const cutoff = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

  return allReadings
    .filter((r) => new Date(r.timestamp) >= cutoff)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
