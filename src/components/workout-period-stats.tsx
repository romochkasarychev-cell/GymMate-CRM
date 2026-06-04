"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorkoutLabelBadge } from "@/components/workout-label-badge";
import {
  calculateVolume,
  workoutLabelOptions,
} from "@/lib/labels";
import { formatPeriodLabel, type WorkoutPeriod } from "@/lib/workout-period";
import type { Workout, WorkoutLabel } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkoutPeriodStatsProps = {
  workouts: Workout[];
  period: WorkoutPeriod;
  calendarOpen: boolean;
  onCalendarToggle: () => void;
};

export function WorkoutPeriodStats({
  workouts,
  period,
  calendarOpen,
  onCalendarToggle,
}: WorkoutPeriodStatsProps) {
  const stats = useMemo(() => {
    const byLabel = workoutLabelOptions.reduce(
      (acc, label) => {
        acc[label] = 0;
        return acc;
      },
      {} as Record<WorkoutLabel, number>,
    );

    let totalVolume = 0;

    for (const workout of workouts) {
      byLabel[workout.label] += 1;
      totalVolume += calculateVolume(workout.sets);
    }

    return {
      count: workouts.length,
      volume: Math.round(totalVolume),
      byLabel,
    };
  }, [workouts]);

  return (
    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide">
          Статистика за период
        </CardTitle>
        <CardDescription className="capitalize">
          {formatPeriodLabel(period)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="gym-stat-card rounded-xl border border-border/60 px-4 py-3">
            <p className="text-sm text-muted-foreground">Всего тренировок</p>
            <p className="font-heading text-3xl font-normal text-primary">{stats.count}</p>
          </div>
          <div className="gym-stat-card rounded-xl border border-border/60 px-4 py-3">
            <p className="text-sm text-muted-foreground">Общий объём</p>
            <p className="font-heading text-3xl font-normal text-primary">
              {stats.volume} кг
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-muted-foreground">По типам нагрузки</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {workoutLabelOptions.map((label) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl border border-border/60 px-3 py-2.5",
                  stats.byLabel[label] > 0 && "bg-secondary/30",
                )}
              >
                <WorkoutLabelBadge label={label} className="mb-2" />
                <p className="font-heading text-2xl font-normal text-foreground">
                  {stats.byLabel[label]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/30 sm:w-auto"
          onClick={onCalendarToggle}
        >
          <CalendarDays className="size-4" />
          {calendarOpen ? "Скрыть календарь" : "Открыть календарь"}
        </Button>
      </CardContent>
    </Card>
  );
}
