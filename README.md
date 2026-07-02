# GymMate CRM

CRM для бодибилдинга: тренировки, прогресс, база знаний.

## Стек

- Next.js 16 (App Router)
- TypeScript, Tailwind CSS, shadcn/ui
- Recharts
- **Бэкенд:** Next.js Route Handlers + Prisma + PostgreSQL (Docker)
- **Логи:** Kafka + Kafka UI (Docker, опционально)
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

**Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
**OpenAPI JSON:** [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi)

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

## Логирование в Kafka

Структурированные логи API (запросы, ошибки) отправляются в топик Kafka, если задан `KAFKA_BROKERS`.

### 1. Запуск Kafka (Docker)

Вместе с PostgreSQL поднимаются **Kafka** (`localhost:9092`) и **Kafka UI** ([http://localhost:8080](http://localhost:8080)):

```bash
npm run db:up
```

### 2. Переменные окружения

В `.env.local`:

```env
KAFKA_BROKERS="localhost:9092"
KAFKA_LOG_TOPIC="gymmate-logs"
KAFKA_CLIENT_ID="gymmate-crm"
```

Чтобы отключить отправку в Kafka: `KAFKA_ENABLED="false"`.

### 3. Просмотр логов

**Kafka UI:** откройте [http://localhost:8080](http://localhost:8080) → Topics → `gymmate-logs` → Messages.

**CLI consumer:**

```bash
npm run logs:consume
```

Каждый API-запрос пишет событие `api.request` (method, path, status, durationMs). Ошибки — `api.error`.

## E2E-тесты (Playwright)

Папка `tests/`. Перед запуском приложение должно работать на [http://localhost:3000](http://localhost:3000) (`npm run dev`).

| Тест | Файл |
|------|------|
| Вход под demo-пользователем | `tests/tests/auth/login.spec.ts` |
| Регистрация нового пользователя | `tests/tests/auth/registerUser.spec.ts` |

```bash
cd tests
npm install
npx playwright install
npx playwright test
```

## Сборка

```bash
npm run build
npm start
```

## Полезные команды

```bash
npm run db:studio   # Prisma Studio
npm run db:down     # Остановить PostgreSQL и Kafka
npm run logs:consume # Читать логи из Kafka в терминале
```
