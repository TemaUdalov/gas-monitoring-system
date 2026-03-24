export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getStatusDistribution } from '@/services/monitoring';

export async function GET() {
  const distribution = await getStatusDistribution();
  return NextResponse.json(distribution);
}
