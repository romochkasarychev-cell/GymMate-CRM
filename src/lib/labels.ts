import type { ArticleCategory, Goal, MuscleGroup, UserStatus, WorkoutLabel } from "@/lib/types";

export const goalLabels: Record<Goal, string> = {
  WEIGHT_LOSS: "Похудение",
  MUSCLE_GAIN: "Набор массы",
  STRENGTH: "Сила",
};

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  CHEST: "Грудь",
  BACK: "Спина",
  LEGS: "Ноги",
  SHOULDERS: "Плечи",
  ARMS: "Руки",
  CORE: "Кор",
};

export const muscleGroupOptions: MuscleGroup[] = [
  "CHEST",
  "BACK",
  "LEGS",
  "SHOULDERS",
  "ARMS",
  "CORE",
];

export const articleCategoryLabels: Record<ArticleCategory, string> = {
  NUTRITION: "Питание",
  TRAINING: "Тренировки",
  RECOVERY: "Восстановление",
};

export const workoutLabelLabels: Record<WorkoutLabel, string> = {
  HEAVY: "Силовая",
  MEDIUM: "Средняя",
  LIGHT: "Лёгкая",
  CARDIO: "Кардио",
};

export const workoutLabelOptions: WorkoutLabel[] = ["HEAVY", "MEDIUM", "LIGHT", "CARDIO"];

export const userStatusLabels: Record<UserStatus, string> = {
  ACTIVE: "Активен",
  INACTIVE: "Не активен",
};

export const foodSourceLabels = {
  BASKOVSKY: "Справочник",
  OPEN_FOOD_FACTS: "Open Food Facts",
  FATSECRET: "FatSecret",
  MANUAL: "Вручную",
} as const;

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function calculateVolume(sets: { weight: number; reps: number }[]) {
  return sets.reduce((total, set) => total + set.weight * set.reps, 0);
}

function pluralizeExercises(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return "упражнений";
  if (mod10 === 1) return "упражнение";
  if (mod10 >= 2 && mod10 <= 4) return "упражнения";
  return "упражнений";
}

export function countWorkoutExercises(sets: { exerciseId: string }[]) {
  return new Set(sets.map((set) => set.exerciseId)).size;
}

export function formatExerciseCount(count: number) {
  return `${count} ${pluralizeExercises(count)}`;
}
