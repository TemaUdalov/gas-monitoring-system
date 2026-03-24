# ГазМониторинг — Информационная система мониторинга газотранспортной сети

## Цель проекта

Демонстрационная информационная система для мониторинга и анализа технологических параметров объектов газотранспортной инфраструктуры.

## Технологический стек

| Компонент | Технология |
|-----------|-----------|
| Фреймворк | Next.js 14 (App Router) |
| Язык | TypeScript |
| Стилизация | Tailwind CSS |
| Графики | Recharts |
| Иконки | Lucide React |
| База данных | PostgreSQL |
| ORM | Prisma 7 |
| Аутентификация | JWT (jose) + bcryptjs |
| API | Next.js API Routes |

## Запуск проекта

### Требования

- Node.js 18+
- PostgreSQL 14+

### Шаг 1. Установить PostgreSQL

**Windows**: скачать с https://www.postgresql.org/download/windows/ и установить. Запомнить пароль пользователя `postgres`.

**macOS**: `brew install postgresql@16 && brew services start postgresql@16`

**Linux**: `sudo apt install postgresql postgresql-contrib && sudo systemctl start postgresql`

### Шаг 2. Создать базу данных

```bash
# Подключиться к PostgreSQL
psql -U postgres

# Создать базу данных
CREATE DATABASE gas_monitoring;
\q
```

### Шаг 3. Клонировать проект

```bash
git clone https://github.com/TemaUdalov/gas-transport-monitoring-system.git
cd gas-transport-monitoring-system
git checkout claude/gas-pipeline-monitoring-mvp-pInFj
```

### Шаг 4. Настроить переменные окружения

```bash
cp .env.example .env
```

Отредактировать `.env`, если пароль PostgreSQL отличается:
```
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/gas_monitoring?schema=public"
JWT_SECRET="gas-monitoring-jwt-secret-key-2026"
```

### Шаг 5. Установить зависимости

```bash
npm install
```

### Шаг 6. Сгенерировать Prisma-клиент и применить схему

```bash
npx prisma generate
npx prisma db push
```

### Шаг 7. Заполнить базу демонстрационными данными

```bash
npx tsx prisma/seed.ts
```

### Шаг 8. Запустить проект

```bash
npm run dev
```

Открыть http://localhost:3000

### Учётные данные для входа

| Логин | Пароль | Роль |
|-------|--------|------|
| operator | operator123 | Оператор |

## Функциональность

### Авторизация
- Страница входа с логином и паролем
- JWT-сессии с httpOnly cookie
- Защита маршрутов через middleware
- Кнопка выхода из системы
- Отображение имени пользователя

### Dashboard (Обзор)
- Карточки метрик: активные объекты, аварии, средняя температура, давление
- Интерактивная SVG-схема сети с контуром России
- График параметров по времени
- Список активных предупреждений
- Таблица состояния объектов

### Оборудование
- Таблица объектов с параметрами
- Поиск, фильтры по статусу и типу
- Детальная страница каждого объекта с графиками и событиями

### Аналитика
- Графики давления, температуры, расхода
- Круговая диаграмма статусов
- Выбор объекта и периода

### Аварии и инциденты
- Журнал событий с фильтрами
- Визуальное выделение критических событий

### Отчёты
- Генерация сводных отчётов
- Скачивание отчётов в HTML-формате
- Печать отчётов (Ctrl+P)
- Архив отчётов

### Уведомления
- Выпадающее окно уведомлений в шапке
- Счётчик непрочитанных
- Отметка как прочитанное
- Автообновление каждые 30 секунд

### Поиск
- Глобальный поиск по объектам и событиям
- Результаты с переходом на страницу объекта

### Настройки
- Рабочее переключение светлой/тёмной темы
- Настройка интервала обновления
- Профиль оператора
- Тестовый режим

### Дата и время
- Динамические часы в шапке (обновление каждую секунду)

## Структура проекта

```
src/
├── app/
│   ├── page.tsx               # Dashboard
│   ├── layout.tsx             # Корневой layout
│   ├── login/page.tsx         # Страница входа
│   ├── equipment/             # Оборудование
│   ├── analytics/             # Аналитика
│   ├── incidents/             # Аварии
│   ├── reports/               # Отчёты
│   ├── settings/              # Настройки
│   └── api/                   # API routes
│       ├── auth/              # Авторизация (login, logout, me)
│       ├── facilities/        # Объекты
│       ├── alerts/            # Предупреждения
│       ├── readings/          # Показания датчиков
│       ├── reports/           # Отчёты + скачивание
│       ├── search/            # Глобальный поиск
│       ├── notifications/     # Уведомления
│       └── analytics/         # Аналитика
├── components/
│   ├── ui/                    # Базовые UI
│   ├── layout/                # Sidebar, Header, AppShell
│   ├── dashboard/             # NetworkMap, AlertsList, FacilitiesTable
│   ├── charts/                # Графики
│   └── providers/             # ThemeProvider
├── services/monitoring.ts     # Бизнес-логика (Prisma)
├── lib/
│   ├── prisma.ts              # Prisma-клиент
│   ├── auth.ts                # JWT-сессии
│   └── utils.ts               # Утилиты
├── types/index.ts             # TypeScript-типы
├── middleware.ts              # Защита маршрутов
└── generated/prisma/          # Сгенерированный Prisma-клиент
prisma/
├── schema.prisma              # Схема БД
└── seed.ts                    # Заполнение демо-данными
```

## База данных

### Сущности

- **User** — пользователи (логин, хеш пароля, роль, ФИО)
- **Facility** — объекты инфраструктуры (15 шт.)
- **SensorReading** — показания датчиков (~2700 записей)
- **Alert** — предупреждения и аварии (12 шт.)
- **Report** — отчёты (6 шт.)
