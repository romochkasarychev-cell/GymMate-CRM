import { fatSecretGet, isFatSecretEnabled } from "@/lib/food/fatsecret-client";
import type { ParsedFood } from "@/lib/food/types";
import { resolveKcal } from "@/lib/food/types";

type FatSecretSearchFood = {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type?: string;
  food_description?: string;
};

type FatSecretSearchResponse = {
  foods?: {
    food?: FatSecretSearchFood | FatSecretSearchFood[];
    total_results?: string;
  };
};

type FatSecretServing = {
  serving_description?: string;
  metric_serving_amount?: string;
  metric_serving_unit?: string;
  calories?: string;
  protein?: string;
  fat?: string;
  carbohydrate?: string;
};

type FatSecretFoodDetail = {
  food_id: string;
  food_name: string;
  brand_name?: string;
  food_type?: string;
  servings?: {
    serving?: FatSecretServing | FatSecretServing[];
  };
};

type FatSecretFoodResponse = {
  food?: FatSecretFoodDetail;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDescription(description: string | undefined) {
  if (!description) return null;

  const caloriesMatch = description.match(/Calories:\s*([\d.]+)\s*kcal/i);
  const fatMatch = description.match(/Fat:\s*([\d.]+)\s*g/i);
  const carbsMatch = description.match(/Carbs:\s*([\d.]+)\s*g/i);
  const proteinMatch = description.match(/Protein:\s*([\d.]+)\s*g/i);
  const per100g = /Per\s*100\s*g/i.test(description);

  const protein = parseNumber(proteinMatch?.[1]);
  const fat = parseNumber(fatMatch?.[1]);
  const carbs = parseNumber(carbsMatch?.[1]);
  const kcal = resolveKcal(parseNumber(caloriesMatch?.[1]), protein, fat, carbs);

  if (kcal == null) return null;

  return { kcal, protein, fat, carbs, per100g };
}

function nutrientsFromServing(serving: FatSecretServing) {
  const protein = parseNumber(serving.protein);
  const fat = parseNumber(serving.fat);
  const carbs = parseNumber(serving.carbohydrate);
  const kcal = resolveKcal(parseNumber(serving.calories), protein, fat, carbs);

  if (kcal == null) return null;

  return { kcal, protein, fat, carbs };
}

function extractPer100g(servings: FatSecretServing[]) {
  const gramServings = servings.filter(
    (serving) => serving.metric_serving_unit === "g" && serving.metric_serving_amount,
  );

  const exact100 = gramServings.find(
    (serving) => Math.abs(parseNumber(serving.metric_serving_amount) - 100) < 0.01,
  );
  if (exact100) {
    return nutrientsFromServing(exact100);
  }

  for (const serving of gramServings) {
    const amount = parseNumber(serving.metric_serving_amount);
    if (amount <= 0) continue;

    const base = nutrientsFromServing(serving);
    if (!base) continue;

    const factor = 100 / amount;
    return {
      kcal: Math.round(base.kcal * factor),
      protein: Math.round(base.protein * factor * 10) / 10,
      fat: Math.round(base.fat * factor * 10) / 10,
      carbs: Math.round(base.carbs * factor * 10) / 10,
    };
  }

  return null;
}

function buildFoodName(food: Pick<FatSecretSearchFood, "food_name" | "brand_name">): string {
  const name = food.food_name.trim();
  const brand = food.brand_name?.trim();
  if (!brand) return name;
  if (name.toLowerCase().includes(brand.toLowerCase())) return name;
  return `${brand} ${name}`;
}

export function mapFatSecretSearchItem(food: FatSecretSearchFood): ParsedFood | null {
  const nutrients = parseDescription(food.food_description);
  if (!nutrients || !nutrients.per100g) return null;

  return {
    name: buildFoodName(food),
    kcal: nutrients.kcal,
    protein: nutrients.protein,
    fat: nutrients.fat,
    carbs: nutrients.carbs,
    brand: food.brand_name?.trim() || undefined,
    source: "FATSECRET",
    externalId: food.food_id,
  };
}

export async function fetchFatSecretFoodDetail(foodId: string): Promise<ParsedFood | null> {
  const response = await fatSecretGet<FatSecretFoodResponse>("/food/v5", {
    food_id: foodId,
  });

  const food = response.food;
  if (!food) return null;

  const nutrients =
    extractPer100g(asArray(food.servings?.serving)) ??
    parseDescription(asArray(food.servings?.serving)[0]?.serving_description);

  if (!nutrients) return null;

  return {
    name: buildFoodName(food),
    kcal: nutrients.kcal,
    protein: nutrients.protein,
    fat: nutrients.fat,
    carbs: nutrients.carbs,
    brand: food.brand_name?.trim() || undefined,
    source: "FATSECRET",
    externalId: food.food_id,
  };
}

export async function searchFatSecretFoods(
  query: string,
  maxResults = 20,
): Promise<ParsedFood[]> {
  if (!isFatSecretEnabled()) return [];

  const response = await fatSecretGet<FatSecretSearchResponse>("/foods/search/v1", {
    search_expression: query,
    max_results: Math.min(Math.max(maxResults, 1), 50),
    page_number: 0,
  });

  const items = asArray(response.foods?.food);
  const foods: ParsedFood[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    let parsed = mapFatSecretSearchItem(item);

    if (!parsed) {
      try {
        parsed = await fetchFatSecretFoodDetail(item.food_id);
      } catch {
        parsed = null;
      }
    }

    if (!parsed || seen.has(parsed.externalId ?? parsed.name)) continue;
    seen.add(parsed.externalId ?? parsed.name);
    foods.push(parsed);
  }

  return foods;
}
