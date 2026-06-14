import type { FoodProduct } from "@/lib/types";

export const mockFoods: FoodProduct[] = [
  {
    id: "mock-1",
    name: "Гречка варёная",
    kcal: 110,
    protein: 4.2,
    fat: 1.1,
    carbs: 21.3,
    source: "MANUAL",
  },
  {
    id: "mock-2",
    name: "Куриная грудка",
    kcal: 113,
    protein: 23.6,
    fat: 1.9,
    carbs: 0.4,
    source: "MANUAL",
  },
  {
    id: "mock-3",
    name: "Творог 5%",
    kcal: 121,
    protein: 17,
    fat: 5,
    carbs: 1.8,
    source: "MANUAL",
  },
  {
    id: "mock-4",
    name: "Яйцо куриное",
    kcal: 157,
    protein: 12.7,
    fat: 11.5,
    carbs: 0.7,
    source: "MANUAL",
  },
  {
    id: "mock-5",
    name: "Рис белый варёный",
    kcal: 130,
    protein: 2.7,
    fat: 0.3,
    carbs: 28.7,
    source: "MANUAL",
  },
  {
    id: "mock-6",
    name: "Овсянка на воде",
    kcal: 88,
    protein: 3,
    fat: 1.7,
    carbs: 15,
    source: "MANUAL",
  },
  {
    id: "mock-7",
    name: "Лосось",
    kcal: 208,
    protein: 20,
    fat: 13,
    carbs: 0,
    source: "MANUAL",
  },
  {
    id: "mock-8",
    name: "Банан",
    kcal: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 22.8,
    source: "MANUAL",
  },
];

export function searchMockFoods(query: string, limit = 20): FoodProduct[] {
  const normalized = query.trim().toLowerCase().replace(/ё/g, "е");
  if (normalized.length < 2) return [];

  const words = normalized.split(/\s+/).filter(Boolean);

  return mockFoods
    .filter((food) => {
      const name = food.name.toLowerCase().replace(/ё/g, "е");
      return words.every((word) => name.includes(word));
    })
    .slice(0, limit);
}
