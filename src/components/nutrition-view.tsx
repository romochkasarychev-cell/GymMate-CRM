"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Flame, Search, UtensilsCrossed } from "lucide-react";
import { PageHeader, StatCard } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { searchMockFoods } from "@/lib/food/mock-foods";
import { fetchFoods, isApiEnabled } from "@/lib/gymmate-api";
import { foodSourceLabels, goalLabels } from "@/lib/labels";
import {
  estimateDailyCalories,
  estimateDailyMacros,
  scaleNutrients,
} from "@/lib/nutrition-utils";
import type { FoodProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

function MacroPill({
  label,
  value,
  unit,
  className,
}: {
  label: string;
  value: string;
  unit: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-lg tracking-wide">
        {value}
        <span className="ml-1 text-sm text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

export function NutritionView() {
  const { profile } = useGymmateStore();
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<FoodProduct[]>([]);
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [grams, setGrams] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogEmpty, setCatalogEmpty] = useState(false);

  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const dailyCalories = useMemo(
    () => estimateDailyCalories(profile.currentWeight, profile.goal),
    [profile.currentWeight, profile.goal],
  );

  const dailyMacros = useMemo(
    () => estimateDailyMacros(dailyCalories, profile.goal),
    [dailyCalories, profile.goal],
  );

  const portionGrams = Math.max(1, Number.parseInt(grams, 10) || 100);

  const portionNutrients = useMemo(() => {
    if (!selected) return null;
    return scaleNutrients(selected, portionGrams);
  }, [selected, portionGrams]);

  const searchFoods = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setFoods([]);
      setError(null);
      setCatalogEmpty(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isApiEnabled()) {
        const data = await fetchFoods(searchQuery);
        setFoods(data.foods);
        setCatalogEmpty(data.foods.length === 0);
        return;
      }

      const mockResults = searchMockFoods(searchQuery);
      setFoods(mockResults);
      setCatalogEmpty(mockResults.length === 0);
    } catch {
      const mockResults = searchMockFoods(searchQuery);
      setFoods(mockResults);
      setCatalogEmpty(mockResults.length === 0 && searchQuery.length >= 2);
      setError(
        mockResults.length === 0
          ? "Не удалось загрузить каталог. Запустите PostgreSQL и выполните npm run foods:import:fast"
          : null,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void searchFoods(debouncedQuery);
  }, [debouncedQuery, searchFoods]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Питание"
        description="Поиск продуктов и расчёт КБЖУ на порцию"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Цель калорий"
          value={`${dailyCalories}`}
          icon={<Flame className="size-4 text-primary" />}
        />
        <StatCard label="Белки / день" value={`${dailyMacros.protein} г`} />
        <StatCard label="Жиры / день" value={`${dailyMacros.fat} г`} />
        <StatCard label="Углеводы / день" value={`${dailyMacros.carbs} г`} />
      </div>

      <p className="text-sm text-muted-foreground">
        Расчёт для цели «{goalLabels[profile.goal]}» при весе{" "}
        {profile.currentWeight > 0 ? `${profile.currentWeight} кг` : "не указан"}.
      </p>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl font-normal uppercase tracking-wide">
              <Search className="size-5 text-primary" />
              Каталог продуктов
            </CardTitle>
            <CardDescription>
              Более 5000 продуктов. Введите название или штрихкод.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food-search">Поиск</Label>
              <Input
                id="food-search"
                placeholder="Например: гречка, творог, 4607025392065"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Поиск...</p>
            ) : null}

            {error ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {!loading && debouncedQuery.length >= 2 && catalogEmpty ? (
              <p className="text-sm text-muted-foreground">
                Ничего не найдено. Попробуйте другое название или импортируйте
                каталог: <code className="text-xs">npm run foods:import:fast</code>
              </p>
            ) : null}

            <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {foods.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(food);
                      setGrams("100");
                    }}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      selected?.id === food.id
                        ? "border-primary/50 bg-primary/10"
                        : "border-border/60 bg-background/40 hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{food.name}</p>
                        {food.brand ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {food.brand}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {food.kcal} ккал
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Б {food.protein} · Ж {food.fat} · У {food.carbs} (на 100 г)
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xl font-normal uppercase tracking-wide">
              <UtensilsCrossed className="size-5 text-primary" />
              КБЖУ порции
            </CardTitle>
            <CardDescription>
              {selected
                ? "Укажите вес порции в граммах"
                : "Выберите продукт из списка слева"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div>
                  <p className="font-medium">{selected.name}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selected.brand ? (
                      <Badge variant="secondary">{selected.brand}</Badge>
                    ) : null}
                    <Badge variant="outline">
                      {foodSourceLabels[selected.source]}
                    </Badge>
                    {selected.barcode ? (
                      <Badge variant="outline">EAN {selected.barcode}</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portion-grams">Вес порции, г</Label>
                  <Input
                    id="portion-grams"
                    inputMode="numeric"
                    value={grams}
                    onChange={(event) => setGrams(event.target.value)}
                  />
                </div>

                {portionNutrients ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MacroPill
                      label="Калории"
                      value={String(portionNutrients.kcal)}
                      unit="ккал"
                      className="col-span-2 sm:col-span-4"
                    />
                    <MacroPill
                      label="Белки"
                      value={String(portionNutrients.protein)}
                      unit="г"
                    />
                    <MacroPill
                      label="Жиры"
                      value={String(portionNutrients.fat)}
                      unit="г"
                    />
                    <MacroPill
                      label="Углеводы"
                      value={String(portionNutrients.carbs)}
                      unit="г"
                    />
                  </div>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  На 100 г: {selected.kcal} ккал · Б {selected.protein} · Ж{" "}
                  {selected.fat} · У {selected.carbs}
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-10 text-center">
                <UtensilsCrossed className="mx-auto mb-3 size-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Найдите продукт и нажмите на него, чтобы увидеть КБЖУ для
                  выбранной порции.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
