# GymMate CRM

CRM для бодибилдинга: тренировки, прогресс, база знаний.

## Стек

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS, shadcn/ui
- Recharts
- **Бэкенд:** Next.js Route Handlers + Prisma + PostgreSQL (Docker)
- **Фронтенд:** localStorage или API (переключается через env)

## Быстрый старт (только UI, localStorage)

```bash
npm install
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000)

## Запуск с бэкендом (PostgreSQL)

### 1. PostgreSQL в Docker

```bash
npm run db:up
```

### 2. Переменные окружения

Скопируйте `.env.example` в `.env.local`:

```bash
copy .env.example .env.local
```

Для работы через API установите:

```env
DATABASE_URL="postgresql://gymmate:gymmate@localhost:5432/gymmate"
NEXT_PUBLIC_USE_API="true"
```

### 3. Схема и seed

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Dev-сервер

```bash
npm run dev
```

Demo-пользователь: `demo@gymmate.local` (без логина на первом этапе).

## Страницы

| Маршрут | Описание |
|---------|----------|
| `/dashboard` | Прогресс и графики |
| `/workouts` | Календарь и история тренировок |
| `/workouts/new` | Новая тренировка |
| `/knowledge` | База знаний |
| `/nutrition` | Питание (заглушка) |
| `/references` | Справочник упражнений |
| `/users` | Пользователи (mock) |
| `/profile` | Личный кабинет |

## API endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/store` | Полный store (profile, workouts, metrics, exercises) |
| PATCH | `/api/profile` | Обновить профиль |
| GET/POST | `/api/workouts` | Список / создать |
| GET/PATCH/DELETE | `/api/workouts/[id]` | CRUD тренировки |
| GET/POST | `/api/exercises` | Список / добавить |
| DELETE | `/api/exercises/[id]` | Удалить упражнение |
| GET | `/api/articles` | Статьи базы знаний |

## Сборка

```bash
npm run build
npm start
```

## Полезные команды

```bash
npm run db:studio   # Prisma Studio
npm run db:down     # Остановить PostgreSQL
```
