import type { ParsedFood } from "@/lib/food/types";
import { normalizeFoodName, resolveKcal } from "@/lib/food/types";

export const BASKOVSKY_FOODS_CSV_URL =
  "https://gist.githubusercontent.com/qertis/3633bfdbdca41d42056793e2342042cc/raw/foods.csv";

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function parseNumber(value: string | undefined): number {
  const trimmed = value?.trim();
  if (!trimmed) return 0;
  const parsed = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseBaskovskyCsv(csv: string): ParsedFood[] {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const foods: ParsedFood[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const fields = parseCsvLine(line);
    if (fields.length < 2) continue;

    const externalId = fields[0]?.trim();
    const name = fields[1]?.trim();
    if (!name || !externalId || externalId === "id") continue;

    const protein = parseNumber(fields[2]);
    const fat = parseNumber(fields[3]);
    const carbs = parseNumber(fields[4]);
    const kcalRaw = fields[5] ? parseNumber(fields[5]) : null;
    const kcal = resolveKcal(kcalRaw, protein, fat, carbs);
    if (kcal == null) continue;

    const normalized = normalizeFoodName(name);
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    foods.push({
      name,
      kcal,
      protein,
      fat,
      carbs,
      source: "BASKOVSKY",
      externalId,
    });
  }

  return foods;
}

export async function fetchBaskovskyFoods(
  url = BASKOVSKY_FOODS_CSV_URL,
): Promise<ParsedFood[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download foods CSV: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  return parseBaskovskyCsv(csv);
}
