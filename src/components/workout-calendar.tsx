"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  filterWorkoutsByRange,
  formatDateRangeLabel,
  isDateInRange,
  normalizeDateRange,
  type DateRange,
} from "@/lib/workout-period";
import type { Workout } from "@/lib/types";
import { cn } from "@/lib/utils";

type WorkoutCalendarProps = {
  workouts: Workout[];
  appliedRange: DateRange | null;
  onRangeApply: (range: DateRange) => void;
};

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function WorkoutCalendar({
  workouts,
  appliedRange,
  onRangeApply,
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() =>
    startOfMonth(appliedRange?.start ?? new Date()),
  );
  const [rangeStart, setRangeStart] = useState<Date | null>(appliedRange?.start ?? null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(appliedRange?.end ?? null);

  useEffect(() => {
    if (appliedRange) {
      setRangeStart(appliedRange.start);
      setRangeEnd(appliedRange.end);
      setCurrentMonth(startOfMonth(appliedRange.start));
    }
  }, [appliedRange]);

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

  const draftRange = useMemo(() => {
    if (!rangeStart || !rangeEnd) {
      return null;
    }

    return normalizeDateRange({ start: rangeStart, end: rangeEnd });
  }, [rangeStart, rangeEnd]);

  const previewWorkouts = useMemo(() => {
    if (!draftRange) {
      return [];
    }

    return filterWorkoutsByRange(workouts, draftRange);
  }, [draftRange, workouts]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonth]);

  function handleDayClick(day: Date) {
    if (!rangeStart || rangeEnd) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }

    if (isSameDay(day, rangeStart)) {
      setRangeEnd(day);
      return;
    }

    if (day < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(day);
      return;
    }

    setRangeEnd(day);
  }

  function handleResetSelection() {
    setRangeStart(null);
    setRangeEnd(null);
  }

  function handleApply() {
    if (!draftRange) {
      return;
    }

    onRangeApply(draftRange);
  }

  return (
    <Card className="gym-stat-card mx-auto w-full max-w-md border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 py-3">
        <CardTitle className="font-heading text-sm font-normal uppercase tracking-wide">
          Выбор периода
        </CardTitle>
        <CardDescription className="text-xs">
          Нажмите дату начала, затем дату окончания периода
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center justify-between gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Предыдущий месяц"
            onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-[120px] text-center text-xs font-medium capitalize">
            {format(currentMonth, "LLLL yyyy", { locale: ru })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Следующий месяц"
            onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-muted-foreground">
          {weekDays.map((day) => (
            <div key={day} className="py-0.5">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day) => {
            const key = toDateKey(day);
            const dayWorkouts = workoutsByDay.get(key) ?? [];
            const hasWorkout = dayWorkouts.length > 0;
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const isRangeStart = rangeStart ? isSameDay(day, rangeStart) : false;
            const isRangeEnd = rangeEnd ? isSameDay(day, rangeEnd) : false;
            const inDraftRange = draftRange ? isDateInRange(day, draftRange) : false;
            const inAppliedRange =
              appliedRange && !rangeStart && !rangeEnd
                ? isDateInRange(day, appliedRange)
                : false;
            const inRange = inDraftRange || inAppliedRange;

            return (
              <button
                key={key}
                type="button"
                onClick={() => inMonth && handleDayClick(day)}
                disabled={!inMonth}
                className={cn(
                  "relative flex h-8 flex-col items-center justify-center rounded text-[10px] transition-colors sm:text-xs",
                  inMonth
                    ? "cursor-pointer text-foreground hover:bg-secondary/60"
                    : "cursor-default text-muted-foreground/40",
                  inRange && inMonth && "bg-primary/15",
                  (isRangeStart || isRangeEnd) && inMonth && "bg-primary/30 ring-1 ring-primary/40",
                  hasWorkout && inMonth && !inRange && "ring-1 ring-primary/20",
                  today && "ring-1 ring-accent/50",
                )}
                aria-label={
                  hasWorkout
                    ? `${format(day, "d MMMM", { locale: ru })} — ${dayWorkouts.length} тренировок`
                    : format(day, "d MMMM", { locale: ru })
                }
              >
                <span className="font-medium leading-none">{format(day, "d")}</span>
                {hasWorkout && inMonth ? (
                  <span className="mt-0.5 size-1 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/20 px-3 py-2.5">
          {draftRange ? (
            <>
              <p className="text-xs text-muted-foreground capitalize">
                {formatDateRangeLabel(draftRange)}
              </p>
              <p className="font-heading text-2xl font-normal text-primary">
                {previewWorkouts.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {previewWorkouts.length === 1 ? "тренировка за период" : "тренировок за период"}
              </p>
            </>
          ) : rangeStart ? (
            <p className="text-xs text-muted-foreground">
              Выберите дату окончания периода
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Выберите дату начала периода
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="gym-btn-primary flex-1 sm:flex-none"
            disabled={!draftRange}
            onClick={handleApply}
          >
            Применить период
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-primary/30"
            disabled={!rangeStart}
            onClick={handleResetSelection}
          >
            Сбросить
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            День с тренировкой
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-3 rounded bg-primary/15 ring-1 ring-primary/30" />
            Выбранный период
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
