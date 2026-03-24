import { NextRequest, NextResponse } from 'next/server';
import { getFacilityReadings, getAggregatedReadings } from '@/services/monitoring';
import { TimePeriod } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get('facilityId');
  const period = (searchParams.get('period') as TimePeriod) || 'week';

  if (facilityId) {
    const readings = await getFacilityReadings(facilityId, period);
    return NextResponse.json(readings);
  }

  const readings = await getAggregatedReadings(period);
  return NextResponse.json(readings);
}
