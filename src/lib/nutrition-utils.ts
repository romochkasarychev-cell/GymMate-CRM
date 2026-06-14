import type { Goal } from "@/lib/types";

const DEFAULT_HEIGHT_CM = 175;
const DEFAULT_AGE = 30;
const ACTIVITY_FACTOR = 1.55;

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  WEIGHT_LOSS: -400,
  MUSCLE_GAIN: 300,
  STRENGTH: 150,
};

export function estimateDailyCalories(weightKg: number, goal: Goal): number {
  const safeWeight = weightKg > 0 ? weightKg : 75;
  const bmr = 10 * safeWeight + 6.25 * DEFAULT_HEIGHT_CM - 5 * DEFAULT_AGE + 5;
  const tdee = bmr * ACTIVITY_FACTOR;
  return Math.round(tdee + GOAL_ADJUSTMENT[goal]);
}

export function estimateDailyMacros(calories: number, goal: Goal) {
  const proteinRatio = goal === "WEIGHT_LOSS" ? 0.3 : goal === "MUSCLE_GAIN" ? 0.25 : 0.22;
  const fatRatio = 0.25;
  const proteinCalories = calories * proteinRatio;
  const fatCalories = calories * fatRatio;
  const carbCalories = calories - proteinCalories - fatCalories;

  return {
    protein: Math.round(proteinCalories / 4),
    fat: Math.round(fatCalories / 9),
    carbs: Math.round(carbCalories / 4),
  };
}

export function scaleNutrients(
  per100g: { kcal: number; protein: number; fat: number; carbs: number },
  grams: number,
) {
  const factor = grams / 100;
  return {
    kcal: Math.round(per100g.kcal * factor),
    protein: Math.round(per100g.protein * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
  };
}
