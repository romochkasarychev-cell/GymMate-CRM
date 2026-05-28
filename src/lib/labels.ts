import type { ArticleCategory, Goal, MuscleGroup } from "@/lib/types";

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

export const articleCategoryLabels: Record<ArticleCategory, string> = {
  NUTRITION: "Питание",
  TRAINING: "Тренировки",
  RECOVERY: "Восстановление",
};

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
