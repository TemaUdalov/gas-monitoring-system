import { NextRequest, NextResponse } from 'next/server';
import { globalSearch } from '@/services/monitoring';

export async function GET(request: NextRequest) {
  const query = new URL(request.url).searchParams.get('q');
  if (!query || query.length < 2) {
    return NextResponse.json({ facilities: [], alerts: [] });
  }
  const results = await globalSearch(query);
  return NextResponse.json(results);
}
