import { NextRequest, NextResponse } from 'next/server';
import { getAlerts, getAlertsForFacility } from '@/services/monitoring';
import { AlertSeverity, AlertStatus } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = (searchParams.get('severity') as AlertSeverity) || undefined;
  const status = (searchParams.get('status') as AlertStatus) || undefined;
  const search = searchParams.get('search') || undefined;
  const facilityId = searchParams.get('facilityId');

  if (facilityId) {
    const alerts = await getAlertsForFacility(facilityId);
    return NextResponse.json(alerts);
  }

  const alerts = await getAlerts({ severity, status, search });
  return NextResponse.json(alerts);
}
