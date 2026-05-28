import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { Workout } from "@/lib/types";

export type WorkoutPeriodType = "week" | "month" | "year";

export type WorkoutPeriod = {
  type: WorkoutPeriodType;
  anchor: Date;
};

export const workoutPeriodLabels: Record<WorkoutPeriodType, string> = {
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};

export function getPeriodBounds(period: WorkoutPeriod) {
  const { type, anchor } = period;

  if (type === "week") {
    return {
      start: startOfWeek(anchor, { weekStartsOn: 1 }),
      end: endOfWeek(anchor, { weekStartsOn: 1 }),
    };
  }

  if (type === "month") {
    return {
      start: startOfMonth(anchor),
      end: endOfMonth(anchor),
    };
  }

  return {
    start: startOfYear(anchor),
    end: endOfYear(anchor),
  };
}

export function filterWorkoutsByPeriod(workouts: Workout[], period: WorkoutPeriod) {
  const { start, end } = getPeriodBounds(period);

  return workouts.filter((workout) =>
    isWithinInterval(workout.date, { start, end }),
  );
}

export function formatPeriodLabel(period: WorkoutPeriod) {
  const { start, end } = getPeriodBounds(period);

  if (period.type === "week") {
    return `${format(start, "d MMM", { locale: ru })} — ${format(end, "d MMM yyyy", { locale: ru })}`;
  }

  if (period.type === "month") {
    return format(start, "LLLL yyyy", { locale: ru });
  }

  return format(start, "yyyy", { locale: ru });
}

export function shiftPeriod(period: WorkoutPeriod, direction: -1 | 1): WorkoutPeriod {
  const { type, anchor } = period;

  if (type === "week") {
    return { type, anchor: addWeeks(anchor, direction) };
  }

  if (type === "month") {
    return { type, anchor: addMonths(anchor, direction) };
  }

  return { type, anchor: addYears(anchor, direction) };
}

export function isDateInPeriod(date: Date, period: WorkoutPeriod) {
  const { start, end } = getPeriodBounds(period);
  return isWithinInterval(date, { start, end });
}

export function getCalendarMonthForPeriod(period: WorkoutPeriod) {
  if (period.type === "year") {
    return startOfYear(period.anchor);
  }

  if (period.type === "week") {
    return startOfMonth(period.anchor);
  }

  return startOfMonth(period.anchor);
}
