export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getReports } from '@/services/monitoring';

export async function GET() {
  const reports = await getReports();
  return NextResponse.json(reports);
}
