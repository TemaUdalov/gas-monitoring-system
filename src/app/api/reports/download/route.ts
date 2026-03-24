import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const reportId = new URL(request.url).searchParams.get('id');

  if (!reportId) {
    // Generate a fresh summary report
    const [facilityCount, criticalCount, avgTemp, avgPressure, activeAlerts] = await Promise.all([
      prisma.facility.count(),
      prisma.alert.count({ where: { severity: 'critical', status: { not: 'resolved' } } }),
      prisma.facility.aggregate({ _avg: { temperature: true } }),
      prisma.facility.aggregate({ _avg: { pressure: true } }),
      prisma.alert.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const criticalFacilities = await prisma.facility.findMany({ where: { status: 'critical' } });
    const warningFacilities = await prisma.facility.findMany({ where: { status: 'warning' } });

    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    let html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>Сводный отчёт</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #333; line-height: 1.6; }
  h1 { border-bottom: 2px solid #1e40af; padding-bottom: 10px; color: #1e40af; }
  h2 { color: #1e40af; margin-top: 30px; }
  .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
  .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
  .metric-value { font-size: 28px; font-weight: bold; }
  .metric-label { color: #6b7280; font-size: 14px; }
  .danger { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
  th { background: #f3f4f6; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
</style></head><body>
<h1>Сводный отчёт о состоянии газотранспортной сети</h1>
<p>Дата формирования: ${now}</p>
<div class="metrics">
  <div class="metric"><div class="metric-label">Активные объекты</div><div class="metric-value">${facilityCount}</div></div>
  <div class="metric"><div class="metric-label">Аварийные события</div><div class="metric-value danger">${criticalCount}</div></div>
  <div class="metric"><div class="metric-label">Среднее давление</div><div class="metric-value">${Math.round((avgPressure._avg.pressure ?? 0) * 100) / 100} МПа</div></div>
  <div class="metric"><div class="metric-label">Средняя температура</div><div class="metric-value">${Math.round((avgTemp._avg.temperature ?? 0) * 10) / 10}°C</div></div>
</div>`;

    if (criticalFacilities.length > 0) {
      html += `<h2>Аварийные объекты</h2><table><tr><th>Объект</th><th>Давление</th><th>Температура</th><th>Расход</th></tr>`;
      for (const f of criticalFacilities) {
        html += `<tr><td>${f.name}</td><td>${f.pressure} МПа</td><td>${f.temperature}°C</td><td>${f.flowRate} м³/ч</td></tr>`;
      }
      html += `</table>`;
    }

    if (warningFacilities.length > 0) {
      html += `<h2>Объекты с предупреждениями</h2><table><tr><th>Объект</th><th>Давление</th><th>Температура</th><th>Расход</th></tr>`;
      for (const f of warningFacilities) {
        html += `<tr><td>${f.name}</td><td>${f.pressure} МПа</td><td>${f.temperature}°C</td><td>${f.flowRate} м³/ч</td></tr>`;
      }
      html += `</table>`;
    }

    if (activeAlerts.length > 0) {
      html += `<h2>Активные предупреждения</h2><table><tr><th>Событие</th><th>Объект</th><th>Критичность</th><th>Описание</th></tr>`;
      for (const a of activeAlerts) {
        html += `<tr><td>${a.title}</td><td>${a.facilityName}</td><td>${a.severity}</td><td>${a.description}</td></tr>`;
      }
      html += `</table>`;
    }

    html += `<div class="footer">Отчёт сгенерирован автоматически ИС «ГазМониторинг» v1.0</div></body></html>`;

    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="gas-monitoring-report-${dateStr}.html"`,
      },
    });
  }

  // Download existing report
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><title>${report.title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 40px auto; color: #333; line-height: 1.6; }
  h1 { border-bottom: 2px solid #1e40af; padding-bottom: 10px; color: #1e40af; }
  .info { color: #6b7280; margin-bottom: 24px; }
  .content { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
</style></head><body>
<h1>${report.title}</h1>
<div class="info">
  <p>Период: ${report.period}</p>
  <p>Тип: ${report.type}</p>
  <p>Дата создания: ${report.createdAt.toLocaleString('ru-RU')}</p>
</div>
<div class="content">${report.summary}</div>
<div class="footer">Отчёт сгенерирован автоматически ИС «ГазМониторинг» v1.0</div>
</body></html>`;

  const safeName = report.title.replace(/[^a-zA-Zа-яА-Я0-9-_ ]/g, '').replace(/\s+/g, '-').slice(0, 60);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeName}.html"`,
    },
  });
}
