type OpenApiSchema = Record<string, unknown>;

const goalEnum = ["WEIGHT_LOSS", "MUSCLE_GAIN", "STRENGTH"] as const;
const muscleGroupEnum = ["CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE"] as const;
const workoutLabelEnum = ["HEAVY", "MEDIUM", "LIGHT", "CARDIO"] as const;
const articleCategoryEnum = ["NUTRITION", "TRAINING", "RECOVERY"] as const;
const measurementKindEnum = [
  "shoulders",
  "chest",
  "waist",
  "hips",
  "armRight",
  "armLeft",
  "legRight",
  "legLeft",
] as const;

const bodyMeasurementsSchema: OpenApiSchema = {
  type: "object",
  required: [
    "shoulders",
    "chest",
    "waist",
    "hips",
    "armRight",
    "armLeft",
    "legRight",
    "legLeft",
  ],
  properties: {
    shoulders: { type: "number", example: 118 },
    chest: { type: "number", example: 102 },
    waist: { type: "number", example: 84 },
    hips: { type: "number", example: 98 },
    armRight: { type: "number", example: 36 },
    armLeft: { type: "number", example: 35.5 },
    legRight: { type: "number", example: 58 },
    legLeft: { type: "number", example: 57.5 },
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "GymMate CRM API",
    version: "1.0.0",
    description: [
      "REST API GymMate CRM (Next.js Route Handlers + Prisma + PostgreSQL).",
      "",
      "### Как тестировать в Swagger UI",
      "1. Вызовите **POST /api/auth/login** (demo: `demo@gymmate.local` / `demo123`).",
      "2. Браузер сохранит httpOnly cookie `gymmate_session` — остальные запросы пойдут с сессией автоматически.",
      "3. Для выхода используйте **POST /api/auth/logout**.",
      "",
      "Требуется `NEXT_PUBLIC_USE_API=true` и запущенный PostgreSQL.",
    ].join("\n"),
  },
  servers: [{ url: "http://localhost:3000", description: "Local dev" }],
  tags: [
    { name: "Auth", description: "Регистрация, вход, сессия" },
    { name: "Store", description: "Агрегированные данные пользователя" },
    { name: "Profile", description: "Профиль и метрики тела" },
    { name: "Workouts", description: "Тренировки" },
    { name: "Exercises", description: "Справочник упражнений" },
    { name: "Articles", description: "База знаний" },
  ],
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "gymmate_session",
        description: "JWT-сессия в httpOnly cookie (устанавливается после login/register)",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        properties: {
          error: { type: "string", example: "BAD_REQUEST" },
          message: { type: "string", example: "Email and password are required" },
        },
      },
      AuthUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          lastName: { type: "string" },
        },
      },
      Profile: {
        type: "object",
        properties: {
          name: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          goal: { type: "string", enum: [...goalEnum] },
          startWeight: { type: "number" },
          currentWeight: { type: "number" },
          startMeasurements: bodyMeasurementsSchema,
          currentMeasurements: bodyMeasurementsSchema,
          registeredAt: { type: "string", format: "date-time" },
        },
      },
      BodyMeasurements: bodyMeasurementsSchema,
      MeasurementFieldKey: {
        type: "string",
        enum: [...measurementKindEnum],
      },
      MeasurementMetric: {
        type: "object",
        properties: {
          date: { type: "string", format: "date-time" },
          kind: { $ref: "#/components/schemas/MeasurementFieldKey" },
          value: { type: "number" },
        },
      },
      BodyMetric: {
        type: "object",
        properties: {
          date: { type: "string", format: "date-time" },
          weight: { type: "number" },
        },
      },
      Exercise: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          muscleGroup: { type: "string", enum: [...muscleGroupEnum] },
          instructions: { type: "string", nullable: true },
        },
      },
      WorkoutSet: {
        type: "object",
        properties: {
          id: { type: "string" },
          exerciseId: { type: "string" },
          exerciseName: { type: "string" },
          setNumber: { type: "integer" },
          weight: { type: "number" },
          reps: { type: "integer" },
        },
      },
      Workout: {
        type: "object",
        properties: {
          id: { type: "string" },
          date: { type: "string", format: "date-time" },
          label: { type: "string", enum: [...workoutLabelEnum] },
          notes: { type: "string", nullable: true },
          sets: {
            type: "array",
            items: { $ref: "#/components/schemas/WorkoutSet" },
          },
        },
      },
      Article: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          slug: { type: "string" },
          content: { type: "string" },
          category: { type: "string", enum: [...articleCategoryEnum] },
        },
      },
      Store: {
        type: "object",
        properties: {
          profile: { $ref: "#/components/schemas/Profile" },
          workouts: {
            type: "array",
            items: { $ref: "#/components/schemas/Workout" },
          },
          bodyMetrics: {
            type: "array",
            items: { $ref: "#/components/schemas/BodyMetric" },
          },
          measurementMetrics: {
            type: "array",
            items: { $ref: "#/components/schemas/MeasurementMetric" },
          },
          exercises: {
            type: "array",
            items: { $ref: "#/components/schemas/Exercise" },
          },
        },
      },
      ProfilePatchBody: {
        type: "object",
        required: ["profile"],
        properties: {
          profile: { $ref: "#/components/schemas/Profile" },
          previousWeight: { type: "number", description: "Предыдущий текущий вес" },
          previousStartWeight: { type: "number", description: "Предыдущий стартовый вес" },
          previousStartMeasurement: {
            type: "object",
            properties: {
              key: { $ref: "#/components/schemas/MeasurementFieldKey" },
              value: { type: "number" },
            },
          },
          previousCurrentMeasurement: {
            type: "object",
            properties: {
              key: { $ref: "#/components/schemas/MeasurementFieldKey" },
              value: { type: "number" },
            },
          },
          measurementUpdate: {
            type: "object",
            deprecated: true,
            properties: {
              scope: { type: "string", enum: ["start", "current"] },
              key: { $ref: "#/components/schemas/MeasurementFieldKey" },
              previousValue: { type: "number" },
            },
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Регистрация",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  name: { type: "string" },
                  lastName: { type: "string" },
                },
              },
              example: {
                email: "newuser@example.com",
                password: "secret123",
                name: "Иван",
                lastName: "Иванов",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Пользователь создан, cookie сессии установлен",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
              },
            },
          },
          "400": { description: "Ошибка валидации", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
          "409": { description: "Email уже занят", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вход",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
              example: {
                email: "demo@gymmate.local",
                password: "demo123",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Успешный вход, cookie сессии установлен",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/AuthUser" },
                  },
                },
              },
            },
          },
          "401": { description: "Неверные credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Выход",
        responses: {
          "200": {
            description: "Сессия сброшена",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Текущий пользователь",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Профиль сессии или null",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      oneOf: [{ $ref: "#/components/schemas/AuthUser" }, { type: "null" }],
                    },
                    profile: { $ref: "#/components/schemas/Profile" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/store": {
      get: {
        tags: ["Store"],
        summary: "Полный store пользователя",
        description: "Profile, workouts, bodyMetrics, measurementMetrics, exercises",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Store",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Store" },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/api/profile": {
      patch: {
        tags: ["Profile"],
        summary: "Обновить профиль",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfilePatchBody" },
            },
          },
        },
        responses: {
          "200": {
            description: "Обновлённый профиль",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    profile: { $ref: "#/components/schemas/Profile" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
    },
    "/api/workouts": {
      get: {
        tags: ["Workouts"],
        summary: "Список тренировок",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Workouts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    workouts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Workout" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Workouts"],
        summary: "Создать тренировку",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["workout", "exercises"],
                properties: {
                  workout: { $ref: "#/components/schemas/Workout" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Созданная тренировка",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    workout: { $ref: "#/components/schemas/Workout" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/workouts/{id}": {
      get: {
        tags: ["Workouts"],
        summary: "Получить тренировку",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Workout",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    workout: { $ref: "#/components/schemas/Workout" },
                  },
                },
              },
            },
          },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        },
      },
      patch: {
        tags: ["Workouts"],
        summary: "Обновить тренировку",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["workout", "exercises"],
                properties: {
                  workout: { $ref: "#/components/schemas/Workout" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Обновлённая тренировка",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    workout: { $ref: "#/components/schemas/Workout" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Workouts"],
        summary: "Удалить тренировку",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Удалено",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/exercises": {
      get: {
        tags: ["Exercises"],
        summary: "Список упражнений",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Exercises",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    exercises: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Exercise" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Exercises"],
        summary: "Добавить упражнение",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "muscleGroup"],
                properties: {
                  name: { type: "string" },
                  muscleGroup: { type: "string", enum: [...muscleGroupEnum] },
                },
              },
              example: { name: "Жим гантелей", muscleGroup: "CHEST" },
            },
          },
        },
        responses: {
          "201": {
            description: "Exercise",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    exercise: { $ref: "#/components/schemas/Exercise" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/exercises/{id}": {
      delete: {
        tags: ["Exercises"],
        summary: "Удалить упражнение",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Удалено",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
    "/api/articles": {
      get: {
        tags: ["Articles"],
        summary: "Список статей",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "Articles",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    articles: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Article" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Articles"],
        summary: "Создать статью",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string", description: "Markdown-содержимое" },
                  category: { type: "string", enum: [...articleCategoryEnum] },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Article",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    article: { $ref: "#/components/schemas/Article" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/articles/{id}": {
      get: {
        tags: ["Articles"],
        summary: "Получить статью",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Article",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    article: { $ref: "#/components/schemas/Article" },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Articles"],
        summary: "Обновить статью",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string", enum: [...articleCategoryEnum] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Article",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    article: { $ref: "#/components/schemas/Article" },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Articles"],
        summary: "Удалить статью",
        security: [{ sessionCookie: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Удалено",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                },
              },
            },
          },
        },
      },
    },
  },
};
