import { NextRequest, NextResponse } from 'next/server';
import { getFacilities, getDashboardMetrics, getFacilityById, getFacilityReadings } from '@/services/monitoring';
import { FacilityStatus, FacilityType, TimePeriod } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const status = (searchParams.get('status') as FacilityStatus) || undefined;
  const type = (searchParams.get('type') as FacilityType) || undefined;
  const metrics = searchParams.get('metrics') === 'true';
  const id = searchParams.get('id');
  const readings = searchParams.get('readings') === 'true';
  const period = (searchParams.get('period') as TimePeriod) || 'week';

  if (metrics) {
    return NextResponse.json(await getDashboardMetrics());
  }

  if (id && readings) {
    return NextResponse.json(await getFacilityReadings(id, period));
  }

  if (id) {
    const facility = await getFacilityById(id);
    return facility
      ? NextResponse.json(facility)
      : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const facilities = await getFacilities({ search, status, type });
  return NextResponse.json(facilities);
}
