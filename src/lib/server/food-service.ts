import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import { isFatSecretEnabled } from "@/lib/food/fatsecret-client";
import { searchFatSecretFoods } from "@/lib/food/parse-fatsecret";
import { normalizeFoodName } from "@/lib/food/types";
import { cacheParsedFoods } from "@/lib/server/food-cache";
import type { FoodProduct } from "@/lib/types";

function mapFood(record: {
  id: string;
  name: string;
  category: string | null;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  barcode: string | null;
  brand: string | null;
  source: FoodProduct["source"];
}): FoodProduct {
  return {
    id: record.id,
    name: record.name,
    category: record.category ?? undefined,
    kcal: record.kcal,
    protein: record.protein,
    fat: record.fat,
    carbs: record.carbs,
    barcode: record.barcode ?? undefined,
    brand: record.brand ?? undefined,
    source: record.source,
  };
}

async function searchLocalFoods(query: string, limit: number): Promise<FoodProduct[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw ApiErrors.badRequest("Query must be at least 2 characters");
  }

  if (/^\d{8,14}$/.test(trimmed)) {
    const byBarcode = await prisma.foodProduct.findUnique({
      where: { barcode: trimmed },
    });

    if (byBarcode) {
      return [mapFood(byBarcode)];
    }
  }

  const normalized = normalizeFoodName(trimmed);
  const words = normalized.split(" ").filter(Boolean);

  const foods = await prisma.foodProduct.findMany({
    where: {
      AND: words.map((word) => ({
        nameNormalized: { contains: word },
      })),
    },
    orderBy: [{ name: "asc" }],
    take: limit,
  });

  return foods.map(mapFood);
}

function mergeFoodResults(primary: FoodProduct[], secondary: FoodProduct[], limit: number) {
  const merged = [...primary];
  const seen = new Set(primary.map((food) => food.id));

  for (const food of secondary) {
    if (merged.length >= limit) break;
    if (seen.has(food.id)) continue;
    seen.add(food.id);
    merged.push(food);
  }

  return merged;
}

export async function searchFoods(query: string, limit = 20): Promise<FoodProduct[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const localFoods = await searchLocalFoods(query, safeLimit);

  if (localFoods.length >= safeLimit || !isFatSecretEnabled()) {
    return localFoods;
  }

  try {
    const remoteFoods = await searchFatSecretFoods(query, safeLimit - localFoods.length);
    if (remoteFoods.length === 0) {
      return localFoods;
    }

    const cached = await cacheParsedFoods(remoteFoods);
    const cachedFoods = cached.map(mapFood);
    return mergeFoodResults(localFoods, cachedFoods, safeLimit);
  } catch {
    return localFoods;
  }
}

export async function getFoodById(id: string): Promise<FoodProduct | null> {
  const food = await prisma.foodProduct.findUnique({ where: { id } });
  return food ? mapFood(food) : null;
}

export async function countFoods(): Promise<number> {
  return prisma.foodProduct.count();
}
