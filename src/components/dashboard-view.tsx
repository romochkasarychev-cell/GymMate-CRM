"use client";

import Link from "next/link";
import { Calendar, CalendarDays, CalendarRange, Dumbbell, Scale, TrendingUp } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { PageHeader, StatCard } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { getDashboardData } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const store = useGymmateStore();
  const data = getDashboardData(store.workouts, store.bodyMetrics, store.profile);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Прогресс"
        description="Обзор тренировок, объёма и динамики веса"
        action={
          <Link href="/workouts/new" className={cn(buttonVariants(), "gym-btn-primary")}>
            Новая тренировка
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Тренировок всего"
          value={String(data.stats.totalWorkouts)}
          icon={<Dumbbell className="size-4 text-primary" />}
        />
        <StatCard
          label="Общий объём"
          value={`${data.stats.totalVolume} кг`}
          icon={<TrendingUp className="size-4 text-primary" />}
        />
        <StatCard
          label="Текущий вес"
          value={data.stats.latestWeight ? `${data.stats.latestWeight} кг` : "—"}
          icon={<Scale className="size-4 text-primary" />}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-normal uppercase tracking-wide">
          Тренировки по периодам
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="За неделю"
            value={String(data.workoutPeriodCounts.week.count)}
            icon={<CalendarRange className="size-4 text-primary" />}
            className="capitalize"
          />
          <StatCard
            label="За месяц"
            value={String(data.workoutPeriodCounts.month.count)}
            icon={<CalendarDays className="size-4 text-primary" />}
            className="capitalize"
          />
          <StatCard
            label="За год"
            value={String(data.workoutPeriodCounts.year.count)}
            icon={<Calendar className="size-4 text-primary" />}
          />
        </div>
        <p className="text-xs text-muted-foreground capitalize">
          Неделя: {data.workoutPeriodCounts.week.label} · Месяц:{" "}
          {data.workoutPeriodCounts.month.label} · Год: {data.workoutPeriodCounts.year.label}
        </p>
      </div>

      <DashboardCharts
        weightData={data.weightData}
        volumeData={data.volumeData}
      />
    </div>
  );
}
