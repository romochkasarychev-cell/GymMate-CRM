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
AUTH_SECRET="your-long-random-secret-min-16-chars"
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

Откройте [http://localhost:3000/login](http://localhost:3000/login).

**Demo-аккаунт после seed:**
- Email: `demo@gymmate.local`
- Пароль: `demo123` (или `DEMO_USER_PASSWORD` из env)

Новые пользователи регистрируются на `/register`. Каждый видит только свои тренировки и профиль.

## Страницы

| Маршрут | Описание |
|---------|----------|
| `/login`, `/register` | Вход и регистрация (при `NEXT_PUBLIC_USE_API=true`) |
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
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход (JWT в httpOnly cookie) |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |
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
