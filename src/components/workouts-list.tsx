"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WorkoutCalendar } from "@/components/workout-calendar";
import { WorkoutPeriodControls } from "@/components/workout-period-controls";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { calculateVolume, formatDate } from "@/lib/labels";
import {
  filterWorkoutsByPeriod,
  formatPeriodLabel,
  workoutPeriodLabels,
  type WorkoutPeriod,
} from "@/lib/workout-period";
import { cn } from "@/lib/utils";

export function WorkoutsList() {
  const { workouts } = useGymmateStore();
  const [period, setPeriod] = useState<WorkoutPeriod>({
    type: "month",
    anchor: new Date(),
  });

  const visibleWorkouts = useMemo(() => {
    return filterWorkoutsByPeriod(workouts, period).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }, [workouts, period]);

  const periodStats = useMemo(() => {
    const totalVolume = visibleWorkouts.reduce(
      (total, workout) => total + calculateVolume(workout.sets),
      0,
    );

    return {
      count: visibleWorkouts.length,
      volume: Math.round(totalVolume),
    };
  }, [visibleWorkouts]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Тренировки"
        description="Календарь сессий и история нагрузок"
        action={
          <Link href="/workouts/new" className={cn(buttonVariants(), "gym-btn-primary")}>
            <Plus className="size-4" />
            Новая тренировка
          </Link>
        }
      />

      <WorkoutPeriodControls period={period} onPeriodChange={setPeriod} />

      <WorkoutCalendar workouts={workouts} period={period} onPeriodChange={setPeriod} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="py-4">
            <CardDescription>Тренировок за период</CardDescription>
            <CardTitle className="font-heading text-3xl font-normal text-primary">
              {periodStats.count}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="py-4">
            <CardDescription>Общий объём за период</CardDescription>
            <CardTitle className="font-heading text-3xl font-normal text-primary">
              {periodStats.volume} кг
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-normal uppercase tracking-wide">
          {workoutPeriodLabels[period.type]} · {formatPeriodLabel(period)}
        </h2>
      </div>

      {visibleWorkouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          За выбранный период тренировок не было.
        </p>
      ) : (
        <div className="grid gap-4">
          {visibleWorkouts.map((workout) => {
            const exerciseNames = [
              ...new Set(workout.sets.map((set) => set.exerciseName)),
            ];
            const volume = Math.round(calculateVolume(workout.sets));

            return (
              <Link key={workout.id} href={`/workouts/${workout.id}`}>
                <Card className="gym-card-hover border-border/70 bg-card/80 py-0 backdrop-blur-sm">
                  <CardHeader className="py-4">
                    <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
                      {formatDate(workout.date)}
                    </CardTitle>
                    <CardDescription>
                      {exerciseNames.slice(0, 3).join(" · ")}
                      {exerciseNames.length > 3 ? " · ..." : ""}
                      <span className="mx-2 text-primary/60">|</span>
                      {workout.sets.length} подходов
                      <span className="mx-2 text-primary/60">|</span>
                      <span className="text-primary">{volume} кг</span> объём
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
