export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const alerts = await prisma.alert.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const unreadCount = await prisma.alert.count({ where: { isRead: false } });

  return NextResponse.json({
    alerts: alerts.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      facilityName: a.facilityName,
      severity: a.severity,
      status: a.status,
      isRead: a.isRead,
      createdAt: a.createdAt.toISOString(),
    })),
    unreadCount,
  });
}

export async function PATCH(request: NextRequest) {
  const { alertId, markAll } = await request.json();

  if (markAll) {
    await prisma.alert.updateMany({ where: { isRead: false }, data: { isRead: true } });
  } else if (alertId) {
    await prisma.alert.update({ where: { id: alertId }, data: { isRead: true } });
  }

  return NextResponse.json({ success: true });
}
