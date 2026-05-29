"use client";

import { Flame, UtensilsCrossed } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NutritionView() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Питание"
        description="Учёт калорий и макронутриентов"
      />

      <Card className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xl font-normal uppercase tracking-wide">
            <UtensilsCrossed className="size-5 text-primary" />
            Раздел в разработке
          </CardTitle>
          <CardDescription>
            Здесь появится расчёт калорийности и дневник питания.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center">
            <Flame className="mx-auto mb-3 size-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              Планируется подключение сервиса для расчёта калорий и составления
              рациона под ваши цели.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
