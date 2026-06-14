import type { FoodSource } from "@/generated/prisma";

export type ParsedFood = {
  name: string;
  category?: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  barcode?: string;
  brand?: string;
  source: FoodSource;
  externalId?: string;
};

export function normalizeFoodName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/ё/g, "е");
}

export function calcKcalFromMacros(protein: number, fat: number, carbs: number): number {
  return Math.round(protein * 4 + fat * 9 + carbs * 4);
}

export function resolveKcal(
  kcal: number | null | undefined,
  protein: number,
  fat: number,
  carbs: number,
): number | null {
  if (kcal != null && kcal > 0) return kcal;
  if (protein > 0 || fat > 0 || carbs > 0) {
    return calcKcalFromMacros(protein, fat, carbs);
  }
  return null;
}
