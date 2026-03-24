import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcryptjs from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.sensorReading.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.report.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcryptjs.hash('operator123', 10);
  await prisma.user.create({
    data: {
      login: 'operator',
      passwordHash,
      role: 'operator',
      fullName: 'Оператор системы',
    },
  });
  console.log('User created: operator / operator123');

  // Create facilities
  const facilitiesData = [
    { id: 'f-001', name: 'КС «Северная»', type: 'compressor_station', locationLat: 61.25, locationLng: 73.38, locationLabel: 'Тюменская обл.', status: 'normal', pressure: 7.45, temperature: 32, flowRate: 1250, lastUpdated: new Date('2026-03-24T08:15:00Z'), description: 'Компрессорная станция на северном участке магистрального газопровода. Обеспечивает транспортировку газа из района добычи.' },
    { id: 'f-002', name: 'КС «Уральская»', type: 'compressor_station', locationLat: 56.84, locationLng: 60.61, locationLabel: 'Свердловская обл.', status: 'warning', pressure: 6.12, temperature: 45, flowRate: 980, lastUpdated: new Date('2026-03-24T08:12:00Z'), description: 'Компрессорная станция на уральском участке. Повышенная температура компрессорного агрегата.' },
    { id: 'f-003', name: 'ГРС «Промышленная-1»', type: 'grs', locationLat: 55.75, locationLng: 49.13, locationLabel: 'Республика Татарстан', status: 'normal', pressure: 1.2, temperature: 18, flowRate: 320, lastUpdated: new Date('2026-03-24T08:10:00Z'), description: 'Газораспределительная станция, обеспечивающая газоснабжение промышленного района.' },
    { id: 'f-004', name: 'Узел учёта «Центральный»', type: 'metering_unit', locationLat: 55.02, locationLng: 73.31, locationLabel: 'Омская обл.', status: 'normal', pressure: 5.5, temperature: 22, flowRate: 1100, lastUpdated: new Date('2026-03-24T08:14:00Z'), description: 'Центральный узел коммерческого учёта газа на пересечении двух магистралей.' },
    { id: 'f-005', name: 'Участок «Север-Центр» (км 120–185)', type: 'pipeline_segment', locationLat: 58.0, locationLng: 68.0, locationLabel: 'Тюменская обл.', status: 'normal', pressure: 7.2, temperature: 28, flowRate: 1350, lastUpdated: new Date('2026-03-24T08:11:00Z'), description: 'Магистральный участок газопровода протяжённостью 65 км. Диаметр трубы 1420 мм.' },
    { id: 'f-006', name: 'КС «Западная»', type: 'compressor_station', locationLat: 57.15, locationLng: 65.53, locationLabel: 'Тюменская обл.', status: 'critical', pressure: 4.8, temperature: 58, flowRate: 620, lastUpdated: new Date('2026-03-24T08:16:00Z'), description: 'Компрессорная станция. Аварийное снижение давления, превышение температуры.' },
    { id: 'f-007', name: 'ГРС «Жилой массив»', type: 'grs', locationLat: 54.73, locationLng: 55.97, locationLabel: 'Республика Башкортостан', status: 'normal', pressure: 1.15, temperature: 16, flowRate: 280, lastUpdated: new Date('2026-03-24T08:09:00Z'), description: 'Газораспределительная станция для жилого микрорайона.' },
    { id: 'f-008', name: 'Скважина №42', type: 'gas_well', locationLat: 63.5, locationLng: 75.8, locationLabel: 'ХМАО', status: 'normal', pressure: 12.3, temperature: 35, flowRate: 450, lastUpdated: new Date('2026-03-24T08:13:00Z'), description: 'Газовая скважина в районе Сургута. Эксплуатируется с 2019 года.' },
    { id: 'f-009', name: 'ПХГ «Резервное»', type: 'underground_storage', locationLat: 52.3, locationLng: 54.1, locationLabel: 'Оренбургская обл.', status: 'normal', pressure: 9.8, temperature: 20, flowRate: 200, lastUpdated: new Date('2026-03-24T08:08:00Z'), description: 'Подземное хранилище газа ёмкостью 3.2 млрд м³. Используется для балансировки сезонных нагрузок.' },
    { id: 'f-010', name: 'Узел учёта «Южный»', type: 'metering_unit', locationLat: 51.77, locationLng: 55.1, locationLabel: 'Оренбургская обл.', status: 'warning', pressure: 5.1, temperature: 38, flowRate: 890, lastUpdated: new Date('2026-03-24T08:07:00Z'), description: 'Узел учёта на южном направлении. Отклонение показаний расходомера.' },
    { id: 'f-011', name: 'Участок «Центр-Юг» (км 340–410)', type: 'pipeline_segment', locationLat: 53.5, locationLng: 58.0, locationLabel: 'Челябинская обл.', status: 'normal', pressure: 6.9, temperature: 24, flowRate: 1180, lastUpdated: new Date('2026-03-24T08:10:00Z'), description: 'Магистральный участок газопровода. Диаметр 1020 мм. Плановый ресурс эксплуатации до 2035 г.' },
    { id: 'f-012', name: 'КС «Восточная»', type: 'compressor_station', locationLat: 56.5, locationLng: 76.0, locationLabel: 'Омская обл.', status: 'critical', pressure: 3.9, temperature: 62, flowRate: 410, lastUpdated: new Date('2026-03-24T08:17:00Z'), description: 'Компрессорная станция. Критическое падение давления на выходе. Аварийная остановка агрегата №2.' },
    { id: 'f-013', name: 'ГРС «Теплоэнерго»', type: 'grs', locationLat: 56.32, locationLng: 44.0, locationLabel: 'Нижегородская обл.', status: 'normal', pressure: 1.18, temperature: 17, flowRate: 350, lastUpdated: new Date('2026-03-24T08:06:00Z'), description: 'Газораспределительная станция для теплоэнергетического комплекса.' },
    { id: 'f-014', name: 'Скважина №78', type: 'gas_well', locationLat: 64.2, locationLng: 76.5, locationLabel: 'ХМАО', status: 'warning', pressure: 11.0, temperature: 42, flowRate: 380, lastUpdated: new Date('2026-03-24T08:05:00Z'), description: 'Газовая скважина. Повышенное содержание конденсата в продукции.' },
    { id: 'f-015', name: 'Участок «Восток» (км 50–95)', type: 'pipeline_segment', locationLat: 57.5, locationLng: 71.0, locationLabel: 'Тюменская обл.', status: 'normal', pressure: 7.0, temperature: 26, flowRate: 1290, lastUpdated: new Date('2026-03-24T08:12:00Z'), description: 'Магистральный участок восточного направления. Трубопровод в удовлетворительном состоянии.' },
  ];

  for (const f of facilitiesData) {
    await prisma.facility.create({ data: f });
  }
  console.log(`Created ${facilitiesData.length} facilities`);

  // Create sensor readings
  const now = new Date('2026-03-24T08:00:00Z');
  let readingCount = 0;

  for (const f of facilitiesData) {
    const readings = [];
    for (let i = 30 * 24; i >= 0; i -= 4) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const noise = () => (Math.random() - 0.5) * 2;
      const trend = Math.sin(i / 24 * Math.PI / 7) * 0.3;

      readings.push({
        facilityId: f.id,
        timestamp,
        pressure: Math.round((f.pressure + noise() * 0.5 + trend) * 100) / 100,
        temperature: Math.round((f.temperature + noise() * 3 + Math.sin(i / 12) * 2) * 10) / 10,
        flowRate: Math.round(f.flowRate + noise() * 50 + trend * 30),
      });
    }
    await prisma.sensorReading.createMany({ data: readings });
    readingCount += readings.length;
  }
  console.log(`Created ${readingCount} sensor readings`);

  // Create alerts
  const alertsData = [
    { facilityId: 'f-006', facilityName: 'КС «Западная»', title: 'Критическое падение давления', description: 'Давление на выходе компрессорной станции снизилось до 4.8 МПа (норма: 6.5–7.5 МПа). Требуется немедленное вмешательство.', severity: 'critical', status: 'active', createdAt: new Date('2026-03-24T07:45:00Z'), isRead: false },
    { facilityId: 'f-012', facilityName: 'КС «Восточная»', title: 'Аварийная остановка агрегата №2', description: 'Компрессорный агрегат №2 остановлен автоматикой из-за превышения температуры подшипников (62°C при норме до 50°C).', severity: 'critical', status: 'active', createdAt: new Date('2026-03-24T08:02:00Z'), isRead: false },
    { facilityId: 'f-002', facilityName: 'КС «Уральская»', title: 'Повышенная температура агрегата', description: 'Температура компрессорного агрегата достигла 45°C (предупредительный порог — 40°C).', severity: 'high', status: 'acknowledged', createdAt: new Date('2026-03-24T06:30:00Z'), isRead: false },
    { facilityId: 'f-010', facilityName: 'Узел учёта «Южный»', title: 'Отклонение показаний расходомера', description: 'Разница между показаниями основного и контрольного расходомеров составляет 3.2% (допуск — 1.5%).', severity: 'medium', status: 'acknowledged', createdAt: new Date('2026-03-24T05:15:00Z'), isRead: true },
    { facilityId: 'f-014', facilityName: 'Скважина №78', title: 'Повышенное содержание конденсата', description: 'Содержание конденсата в продукции скважины превышает норму на 18%. Рекомендована проверка сепаратора.', severity: 'medium', status: 'active', createdAt: new Date('2026-03-24T04:00:00Z'), isRead: false },
    { facilityId: 'f-006', facilityName: 'КС «Западная»', title: 'Превышение температуры на выходе', description: 'Температура газа на выходе станции 58°C (предупредительный порог — 50°C).', severity: 'high', status: 'active', createdAt: new Date('2026-03-24T07:30:00Z'), isRead: false },
    { facilityId: 'f-005', facilityName: 'Участок «Север-Центр» (км 120–185)', title: 'Снижение расхода на участке', description: 'Расход газа на участке снизился на 8% за последние 6 часов. Возможна утечка или перераспределение потоков.', severity: 'low', status: 'resolved', createdAt: new Date('2026-03-23T22:00:00Z'), isRead: true },
    { facilityId: 'f-012', facilityName: 'КС «Восточная»', title: 'Вибрация агрегата №1 выше нормы', description: 'Уровень вибрации компрессорного агрегата №1 составляет 7.2 мм/с (норма — до 6.0 мм/с).', severity: 'high', status: 'acknowledged', createdAt: new Date('2026-03-24T03:20:00Z'), isRead: false },
    { facilityId: 'f-003', facilityName: 'ГРС «Промышленная-1»', title: 'Плановое обслуживание завершено', description: 'Плановое техническое обслуживание регуляторов давления выполнено. Параметры в норме.', severity: 'low', status: 'resolved', createdAt: new Date('2026-03-23T14:00:00Z'), isRead: true },
    { facilityId: 'f-009', facilityName: 'ПХГ «Резервное»', title: 'Снижение уровня газа в хранилище', description: 'Объём газа в хранилище снизился до 72% от ёмкости. Рекомендовано начать закачку.', severity: 'low', status: 'active', createdAt: new Date('2026-03-24T01:00:00Z'), isRead: true },
    { facilityId: 'f-002', facilityName: 'КС «Уральская»', title: 'Отклонение давления масла', description: 'Давление масла в системе смазки агрегата ниже рекомендуемого уровня на 0.3 МПа.', severity: 'medium', status: 'active', createdAt: new Date('2026-03-24T02:45:00Z'), isRead: false },
    { facilityId: 'f-011', facilityName: 'Участок «Центр-Юг» (км 340–410)', title: 'Коррозионный износ обнаружен', description: 'По результатам диагностики обнаружен участок с утонением стенки трубы до 6.2 мм (норма — 8.0 мм). Требуется плановый ремонт.', severity: 'medium', status: 'acknowledged', createdAt: new Date('2026-03-22T10:00:00Z'), isRead: true },
  ];

  await prisma.alert.createMany({ data: alertsData });
  console.log(`Created ${alertsData.length} alerts`);

  // Create reports
  const reportsData = [
    { title: 'Ежедневный отчёт о состоянии сети — 23.03.2026', period: '23.03.2026', type: 'daily', createdAt: new Date('2026-03-23T23:59:00Z'), summary: 'За отчётный период зафиксировано 2 аварийных события на КС «Западная» и КС «Восточная». Среднее давление в сети — 6.1 МПа. Средняя температура — 29°C. Общий расход — 8 430 тыс. м³/ч. Рекомендовано усилить контроль за станциями с повышенной температурой.' },
    { title: 'Еженедельный аналитический отчёт — неделя 12/2026', period: '17.03–23.03.2026', type: 'weekly', createdAt: new Date('2026-03-23T18:00:00Z'), summary: 'Давление в сети стабильно. Зафиксировано 5 предупреждений и 3 аварийных события. Наибольшая нагрузка — на северном участке. Расход газа увеличился на 4% по сравнению с предыдущей неделей. Два объекта требуют планового ТО.' },
    { title: 'Месячный отчёт — февраль 2026', period: 'Февраль 2026', type: 'monthly', createdAt: new Date('2026-03-01T10:00:00Z'), summary: 'За февраль транспортировано 6.2 млрд м³ газа. Средний коэффициент загрузки — 78%. Аварийных остановок — 4. Плановое ТО выполнено на 12 объектах. Общее состояние инфраструктуры — удовлетворительное. Отмечена тенденция к росту температурных отклонений на КС «Уральская».' },
    { title: 'Отчёт об инциденте — КС «Западная»', period: '24.03.2026', type: 'incident', createdAt: new Date('2026-03-24T08:30:00Z'), summary: 'Описание инцидента: критическое снижение давления на выходе КС «Западная» до 4.8 МПа. Причина: неисправность клапана на линии нагнетания. Последствия: снижение пропускной способности участка на 40%. Меры: аварийная бригада направлена на объект, резервный агрегат переведён в работу.' },
    { title: 'Ежедневный отчёт о состоянии сети — 22.03.2026', period: '22.03.2026', type: 'daily', createdAt: new Date('2026-03-22T23:59:00Z'), summary: 'Работа газотранспортной сети в штатном режиме. Аварийных событий не зафиксировано. 1 предупреждение на узле учёта «Южный» — отклонение расходомера. Плановое ТО на ГРС «Промышленная-1» выполнено в полном объёме.' },
    { title: 'Отчёт об инциденте — КС «Восточная»', period: '24.03.2026', type: 'incident', createdAt: new Date('2026-03-24T09:00:00Z'), summary: 'Описание инцидента: аварийная остановка компрессорного агрегата №2 на КС «Восточная». Причина: перегрев подшипников (62°C). Произведена автоматическая остановка. Агрегат №1 работает в штатном режиме, нагрузка перераспределена.' },
  ];

  await prisma.report.createMany({ data: reportsData });
  console.log(`Created ${reportsData.length} reports`);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
