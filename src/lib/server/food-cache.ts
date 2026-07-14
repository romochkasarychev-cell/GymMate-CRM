import { prisma } from "@/lib/prisma";
import type { ParsedFood } from "@/lib/food/types";
import { normalizeFoodName } from "@/lib/food/types";

export async function upsertParsedFood(food: ParsedFood) {
  const nameNormalized = normalizeFoodName(food.name);

  if (food.barcode) {
    const byBarcode = await prisma.foodProduct.findUnique({
      where: { barcode: food.barcode },
    });

    if (byBarcode) {
      return prisma.foodProduct.update({
        where: { id: byBarcode.id },
        data: {
          name: food.name,
          nameNormalized,
          category: food.category,
          kcal: food.kcal,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          brand: food.brand,
          source: food.source,
          externalId: food.externalId,
        },
      });
    }
  }

  if (food.externalId && food.source) {
    const byExternal = await prisma.foodProduct.findFirst({
      where: {
        source: food.source,
        externalId: food.externalId,
      },
    });

    if (byExternal) {
      return prisma.foodProduct.update({
        where: { id: byExternal.id },
        data: {
          name: food.name,
          nameNormalized,
          category: food.category,
          kcal: food.kcal,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          barcode: food.barcode,
          brand: food.brand,
        },
      });
    }
  }

  const existing = await prisma.foodProduct.findFirst({
    where: {
      name: food.name,
      source: food.source,
      brand: food.brand ?? null,
    },
  });

  if (existing) {
    return prisma.foodProduct.update({
      where: { id: existing.id },
      data: {
        nameNormalized,
        category: food.category,
        kcal: food.kcal,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        barcode: food.barcode,
        externalId: food.externalId,
      },
    });
  }

  try {
    return await prisma.foodProduct.create({
      data: {
        name: food.name,
        nameNormalized,
        category: food.category,
        kcal: food.kcal,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        barcode: food.barcode,
        brand: food.brand,
        source: food.source,
        externalId: food.externalId,
      },
    });
  } catch {
    return null;
  }
}

export async function cacheParsedFoods(foods: ParsedFood[]) {
  const records = [];

  for (const food of foods) {
    const record = await upsertParsedFood(food);
    if (record) records.push(record);
  }

  return records;
}
