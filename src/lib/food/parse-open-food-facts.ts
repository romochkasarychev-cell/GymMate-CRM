import type { ParsedFood } from "@/lib/food/types";
import { normalizeFoodName, resolveKcal } from "@/lib/food/types";

const OFF_SEARCH_URL = "https://ru.openfoodfacts.org/cgi/search.pl";

type OffNutriments = {
  "energy-kcal_100g"?: number;
  "energy-kcal"?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
};

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_ru?: string;
  brands?: string;
  nutriments?: OffNutriments;
};

type OffSearchResponse = {
  count?: number;
  page?: number;
  page_count?: number;
  page_size?: number;
  products?: OffProduct[];
};

export type OffParseOptions = {
  maxPages?: number;
  pageSize?: number;
  delayMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOffProduct(product: OffProduct): ParsedFood | null {
  const name = product.product_name_ru?.trim() || product.product_name?.trim();
  const barcode = product.code?.trim();
  if (!name || !barcode) return null;

  const nutriments = product.nutriments ?? {};
  const protein = nutriments.proteins_100g ?? 0;
  const fat = nutriments.fat_100g ?? 0;
  const carbs = nutriments.carbohydrates_100g ?? 0;
  const kcal = resolveKcal(
    nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"],
    protein,
    fat,
    carbs,
  );

  if (kcal == null) return null;

  const brand = product.brands?.split(",")[0]?.trim() || undefined;

  return {
    name,
    kcal,
    protein,
    fat,
    carbs,
    barcode,
    brand,
    source: "OPEN_FOOD_FACTS",
    externalId: barcode,
  };
}

async function fetchOffPage(page: number, pageSize: number): Promise<OffSearchResponse> {
  const params = new URLSearchParams({
    action: "process",
    json: "1",
    page: String(page),
    page_size: String(pageSize),
    tagtype_0: "countries",
    tag_contains_0: "contains",
    tag_0: "russia",
    fields: "code,product_name,product_name_ru,brands,nutriments",
  });

  const response = await fetch(`${OFF_SEARCH_URL}?${params.toString()}`, {
    headers: {
      "User-Agent": "GymMate-CRM/1.0 (food import; contact: demo@gymmate.local)",
    },
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as OffSearchResponse;
}

export async function fetchOpenFoodFactsRussia(
  options: OffParseOptions = {},
): Promise<ParsedFood[]> {
  const maxPages = options.maxPages ?? 20;
  const pageSize = options.pageSize ?? 100;
  const delayMs = options.delayMs ?? 300;

  const foods: ParsedFood[] = [];
  const seenBarcodes = new Set<string>();
  const seenNames = new Set<string>();

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await fetchOffPage(page, pageSize);
    const products = data.products ?? [];

    if (products.length === 0) break;

    for (const product of products) {
      const parsed = parseOffProduct(product);
      if (!parsed) continue;

      const barcodeKey = parsed.barcode!;
      const nameKey = normalizeFoodName(parsed.name);

      if (seenBarcodes.has(barcodeKey) || seenNames.has(nameKey)) continue;

      seenBarcodes.add(barcodeKey);
      seenNames.add(nameKey);
      foods.push(parsed);
    }

    const totalPages = data.page_count ?? page;
    if (page >= totalPages) break;

    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return foods;
}
