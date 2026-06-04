import type {
  Article,
  BodyMetric,
  Exercise,
  Profile,
  User,
  Workout,
} from "@/lib/types";

export const profile: Profile = {
  name: "Роман",
  lastName: "Сарычев",
  email: "demo@gymmate.local",
  phone: "+7 (900) 123-45-67",
  goal: "MUSCLE_GAIN",
  startWeight: 80.2,
  currentWeight: 78.5,
};

export const users = [
  {
    id: "u-1",
    name: "Роман",
    email: "demo@gymmate.local",
    goal: "MUSCLE_GAIN",
    startWeight: 80.2,
    currentWeight: 78.5,
    registeredAt: new Date("2025-11-12T10:00:00"),
    status: "ACTIVE",
  },
] as const satisfies User[];

export const exercises: Exercise[] = [
  { id: "ex-1", name: "Жим штанги лёжа", muscleGroup: "CHEST" },
  { id: "ex-2", name: "Приседания со штангой", muscleGroup: "LEGS" },
  { id: "ex-3", name: "Становая тяга", muscleGroup: "BACK" },
  { id: "ex-4", name: "Подтягивания", muscleGroup: "BACK" },
  { id: "ex-5", name: "Жим штанги стоя", muscleGroup: "SHOULDERS" },
  { id: "ex-6", name: "Тяга штанги в наклоне", muscleGroup: "BACK" },
  { id: "ex-7", name: "Румынская тяга", muscleGroup: "LEGS" },
  { id: "ex-8", name: "Выпады с гантелями", muscleGroup: "LEGS" },
  { id: "ex-9", name: "Разведение гантелей лёжа", muscleGroup: "CHEST" },
  { id: "ex-10", name: "Подъём штанги на бицепс", muscleGroup: "ARMS" },
  { id: "ex-11", name: "Жим ногами", muscleGroup: "LEGS" },
  { id: "ex-12", name: "Планка", muscleGroup: "CORE" },
];

export const workouts: Workout[] = [
  {
    id: "w-1",
    date: new Date("2026-05-26T18:00:00"),
    label: "HEAVY",
    notes: "Хорошая тренировка, прогресс в жиме",
    sets: [
      { id: "s-1", exerciseId: "ex-1", exerciseName: "Жим штанги лёжа", setNumber: 1, weight: 60, reps: 10 },
      { id: "s-2", exerciseId: "ex-1", exerciseName: "Жим штанги лёжа", setNumber: 2, weight: 65, reps: 8 },
      { id: "s-3", exerciseId: "ex-1", exerciseName: "Жим штанги лёжа", setNumber: 3, weight: 65, reps: 7 },
      { id: "s-4", exerciseId: "ex-6", exerciseName: "Тяга штанги в наклоне", setNumber: 1, weight: 50, reps: 10 },
      { id: "s-5", exerciseId: "ex-6", exerciseName: "Тяга штанги в наклоне", setNumber: 2, weight: 55, reps: 8 },
      { id: "s-6", exerciseId: "ex-5", exerciseName: "Жим штанги стоя", setNumber: 1, weight: 40, reps: 10 },
    ],
  },
  {
    id: "w-2",
    date: new Date("2026-05-24T17:30:00"),
    label: "MEDIUM",
    notes: "Ноги — тяжело, но выполнил план",
    sets: [
      { id: "s-7", exerciseId: "ex-2", exerciseName: "Приседания со штангой", setNumber: 1, weight: 80, reps: 8 },
      { id: "s-8", exerciseId: "ex-2", exerciseName: "Приседания со штангой", setNumber: 2, weight: 85, reps: 6 },
      { id: "s-9", exerciseId: "ex-2", exerciseName: "Приседания со штангой", setNumber: 3, weight: 85, reps: 5 },
      { id: "s-10", exerciseId: "ex-11", exerciseName: "Жим ногами", setNumber: 1, weight: 120, reps: 12 },
      { id: "s-11", exerciseId: "ex-11", exerciseName: "Жим ногами", setNumber: 2, weight: 130, reps: 10 },
      { id: "s-12", exerciseId: "ex-7", exerciseName: "Румынская тяга", setNumber: 1, weight: 60, reps: 10 },
    ],
  },
  {
    id: "w-3",
    date: new Date("2026-05-22T18:15:00"),
    label: "LIGHT",
    sets: [
      { id: "s-13", exerciseId: "ex-3", exerciseName: "Становая тяга", setNumber: 1, weight: 90, reps: 6 },
      { id: "s-14", exerciseId: "ex-3", exerciseName: "Становая тяга", setNumber: 2, weight: 100, reps: 5 },
      { id: "s-15", exerciseId: "ex-4", exerciseName: "Подтягивания", setNumber: 1, weight: 0, reps: 8 },
      { id: "s-16", exerciseId: "ex-4", exerciseName: "Подтягивания", setNumber: 2, weight: 0, reps: 7 },
      { id: "s-17", exerciseId: "ex-12", exerciseName: "Планка", setNumber: 1, weight: 0, reps: 1 },
    ],
  },
];

export const bodyMetrics: BodyMetric[] = [
  { date: new Date("2026-04-01"), weight: 80.2 },
  { date: new Date("2026-04-15"), weight: 79.8 },
  { date: new Date("2026-05-01"), weight: 79.1 },
  { date: new Date("2026-05-15"), weight: 78.8 },
  { date: new Date("2026-05-26"), weight: 78.5 },
];

export const articles: Article[] = [
  {
    id: "a-1",
    title: "С чего начать в тренажёрном зале",
    slug: "start-in-gym",
    category: "TRAINING",
    content: `# С чего начать

Выберите 3–4 базовых упражнения на всё тело и тренируйтесь 2–3 раза в неделю.

## Базовый план
- Приседания или жим ногами
- Жим лёжа или отжимания
- Тяга (штанга, блок или подтягивания)
- Планка или скручивания

Добавляйте вес постепенно, когда выполняете все подходы с хорошей техникой.`,
  },
  {
    id: "a-2",
    title: "Сколько белка нужно для роста мышц",
    slug: "protein-guide",
    category: "NUTRITION",
    content: `# Белок и мышцы

Для большинства людей достаточно **1.6–2.2 г белка на кг веса** в сутки.

## Практика
- Распределяйте белок на 3–4 приёма пищи
- После тренировки — полноценный приём с белком и углеводами
- Не забывайте про воду и сон`,
  },
  {
    id: "a-3",
    title: "Как восстанавливаться между тренировками",
    slug: "recovery-basics",
    category: "RECOVERY",
    content: `# Восстановление

Рост происходит не в зале, а во время отдыха.

## Основы
- **Сон:** 7–9 часов
- **Питание:** достаточно калорий и белка
- **Нагрузка:** не тренируйте одну группу мышц каждый день`,
  },
  {
    id: "a-4",
    title: "Как прогрессировать в базовых упражнениях",
    slug: "progressive-overload",
    category: "TRAINING",
    content: `# Прогрессия нагрузки

Добавляйте вес, повторы или подходы, когда текущий объём даётся уверенно.

## Простое правило
Если выполнили верхнюю границу повторений во всех подходах — увеличьте вес на следующей тренировке.`,
  },
  {
    id: "a-5",
    title: "Разминка перед силовой тренировкой",
    slug: "warmup-guide",
    category: "TRAINING",
    content: `# Разминка

5–10 минут лёгкого кардио + 2–3 разминочных подхода первого упражнения.

## Зачем
- Подготовка суставов и мышц
- Снижение риска травм
- Лучшие рабочие веса`,
  },
];

export function getWorkoutById(id: string) {
  return workouts.find((workout) => workout.id === id);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}
