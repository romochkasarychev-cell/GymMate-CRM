import { writeFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { PrismaClient } from "../src/generated/prisma";
import { fetchBaskovskyFoods } from "../src/lib/food/parse-baskovsky-csv";
import { fetchOpenFoodFactsRussia } from "../src/lib/food/parse-open-food-facts";
import type { ParsedFood } from "../src/lib/food/types";
import { normalizeFoodName } from "../src/lib/food/types";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

function mergeFoods(primary: ParsedFood[], secondary: ParsedFood[]): ParsedFood[] {
  const merged = [...primary];
  const seenNames = new Set(primary.map((item) => normalizeFoodName(item.name)));
  const seenBarcodes = new Set(
    primary.map((item) => item.barcode).filter((barcode): barcode is string => Boolean(barcode)),
  );

  for (const item of secondary) {
    const nameKey = normalizeFoodName(item.name);
    if (seenNames.has(nameKey)) continue;
    if (item.barcode && seenBarcodes.has(item.barcode)) continue;

    seenNames.add(nameKey);
    if (item.barcode) seenBarcodes.add(item.barcode);
    merged.push(item);
  }

  return merged;
}

async function importFoods(foods: ParsedFood[]) {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const food of foods) {
    const nameNormalized = normalizeFoodName(food.name);

    if (food.barcode) {
      const byBarcode = await prisma.foodProduct.findUnique({
        where: { barcode: food.barcode },
      });

      if (byBarcode) {
        await prisma.foodProduct.update({
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
        updated += 1;
        continue;
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
      await prisma.foodProduct.update({
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
      updated += 1;
      continue;
    }

    try {
      await prisma.foodProduct.create({
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
      created += 1;
    } catch {
      skipped += 1;
    }
  }

  return { created, updated, skipped };
}

async function main() {
  const skipOff = process.argv.includes("--skip-off");
  const saveJson = process.argv.includes("--save-json");
  const clearExisting = process.argv.includes("--clear");

  const offMaxPagesArg = process.argv.find((arg) => arg.startsWith("--off-pages="));
  const offMaxPages = offMaxPagesArg
    ? Number.parseInt(offMaxPagesArg.split("=")[1] ?? "20", 10)
    : 20;

  console.log("Downloading Baskovsky foods CSV (~5200 products)...");
  const baskovskyFoods = await fetchBaskovskyFoods();
  console.log(`Parsed ${baskovskyFoods.length} products from Baskovsky CSV`);

  let offFoods: ParsedFood[] = [];
  if (!skipOff) {
    console.log(`Fetching Open Food Facts (Russia), up to ${offMaxPages} pages...`);
    offFoods = await fetchOpenFoodFactsRussia({ maxPages: offMaxPages });
    console.log(`Parsed ${offFoods.length} products from Open Food Facts`);
  }

  const foods = mergeFoods(baskovskyFoods, offFoods);
  console.log(`Total unique products: ${foods.length}`);

  if (saveJson) {
    const outputPath = path.join(process.cwd(), "data", "foods-parsed.json");
    await writeFile(outputPath, JSON.stringify(foods, null, 2), "utf8");
    console.log(`Saved JSON to ${outputPath}`);
  }

  if (clearExisting) {
    const deleted = await prisma.foodProduct.deleteMany();
    console.log(`Cleared ${deleted.count} existing food records`);
  }

  console.log("Importing into database...");
  const result = await importFoods(foods);
  console.log(
    `Done: created=${result.created}, updated=${result.updated}, skipped=${result.skipped}`,
  );

  const total = await prisma.foodProduct.count();
  console.log(`FoodProduct rows in DB: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
