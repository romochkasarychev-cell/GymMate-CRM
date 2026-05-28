"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCalendarMonthForPeriod,
  isDateInPeriod,
  type WorkoutPeriod,
} from "@/lib/workout-period";
import type { Workout } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkoutCalendarProps = {
  workouts: Workout[];
  period: WorkoutPeriod;
  onPeriodChange: (period: WorkoutPeriod) => void;
};

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function WorkoutCalendar({ workouts, period, onPeriodChange }: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    getCalendarMonthForPeriod(period),
  );

  useEffect(() => {
    setCurrentMonth(getCalendarMonthForPeriod(period));
  }, [period]);

  const workoutsByDay = useMemo(() => {
    const map = new Map<string, Workout[]>();

    for (const workout of workouts) {
      const key = toDateKey(workout.date);
      const existing = map.get(key) ?? [];
      existing.push(workout);
      map.set(key, existing);
    }

    return map;
  }, [workouts]);

  const workoutsByMonth = useMemo(() => {
    const map = new Map<number, Workout[]>();
    const year = period.anchor.getFullYear();

    for (const workout of workouts) {
      if (workout.date.getFullYear() !== year) continue;

      const monthIndex = workout.date.getMonth();
      const existing = map.get(monthIndex) ?? [];
      existing.push(workout);
      map.set(monthIndex, existing);
    }

    return map;
  }, [workouts, period.anchor]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  if (period.type === "year") {
    const year = period.anchor.getFullYear();

    return (
      <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Календарь — {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthDate = new Date(year, monthIndex, 1);
              const monthWorkouts = workoutsByMonth.get(monthIndex) ?? [];
              const hasWorkouts = monthWorkouts.length > 0;
              const isCurrentMonth = isSameMonth(monthDate, new Date());

              return (
                <button
                  key={monthIndex}
                  type="button"
                  onClick={() =>
                    onPeriodChange({
                      type: "month",
                      anchor: monthDate,
                    })
                  }
                  className={cn(
                    "rounded-xl border border-border/60 p-3 text-left transition-all hover:border-primary/40 hover:bg-secondary/50",
                    hasWorkouts && "bg-primary/10 ring-1 ring-primary/25",
                    isCurrentMonth && "ring-1 ring-accent/50",
                  )}
                >
                  <p className="font-heading text-sm uppercase tracking-wide capitalize">
                    {format(monthDate, "LLL", { locale: ru })}
                  </p>
                  <p className="mt-2 text-2xl font-medium text-primary">
                    {monthWorkouts.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {monthWorkouts.length === 1 ? "тренировка" : "тренировок"}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
          Календарь
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Предыдущий месяц"
            onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: ru })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Следующий месяц"
            onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {weekDays.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const key = toDateKey(day);
            const dayWorkouts = workoutsByDay.get(key) ?? [];
            const hasWorkout = dayWorkouts.length > 0;
            const inMonth = isSameMonth(day, currentMonth);
            const inPeriod = isDateInPeriod(day, period);
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm",
                  inMonth ? "text-foreground" : "text-muted-foreground/40",
                  period.type === "week" && inPeriod && inMonth && "bg-accent/15",
                  period.type === "month" && inPeriod && inMonth && "bg-primary/5",
                  hasWorkout && inMonth && "ring-1 ring-primary/20",
                  hasWorkout && inMonth && inPeriod && "bg-primary/15 ring-primary/30",
                  today && "ring-1 ring-accent/50",
                )}
                aria-label={
                  hasWorkout
                    ? `${format(day, "d MMMM", { locale: ru })} — ${dayWorkouts.length} тренировок`
                    : format(day, "d MMMM", { locale: ru })
                }
              >
                <span className="font-medium">{format(day, "d")}</span>
                {hasWorkout && inMonth ? (
                  <span className="mt-0.5 size-1.5 rounded-full bg-primary" />
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            День с тренировкой
          </span>
          {period.type === "week" ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-4 rounded bg-accent/15 ring-1 ring-accent/40" />
              Выбранная неделя
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-4 rounded ring-1 ring-accent/50" />
            Сегодня
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
