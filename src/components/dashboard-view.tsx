"use client";

import { Calendar, CalendarDays, CalendarRange, Dumbbell, Scale, TrendingUp } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { PageHeader, StatCard } from "@/components/page-header";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { getDashboardData } from "@/lib/dashboard-data";

export function DashboardView() {
  const store = useGymmateStore();
  const data = getDashboardData(
    store.workouts,
    store.bodyMetrics,
    store.measurementMetrics,
    store.profile,
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Прогресс"
        description="Обзор тренировок, объёма, веса и замеров"
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
        <p className="text-xs leading-relaxed text-muted-foreground capitalize sm:text-sm">
          <span className="block sm:inline">Неделя: {data.workoutPeriodCounts.week.label}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">Месяц: {data.workoutPeriodCounts.month.label}</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">Год: {data.workoutPeriodCounts.year.label}</span>
        </p>
      </div>

      <DashboardCharts
        weightData={data.weightData}
        measurementCharts={data.measurementCharts}
        volumeData={data.volumeData}
      />
    </div>
  );
}
