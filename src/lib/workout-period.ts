import {
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ru } from "date-fns/locale";
import type { Workout } from "@/lib/types";

export type WorkoutPeriodType = "week" | "month" | "year";

export type WorkoutPeriod =
  | { type: WorkoutPeriodType; anchor: Date }
  | { type: "custom"; start: Date; end: Date };

export type DateRange = {
  start: Date;
  end: Date;
};

export const workoutPeriodLabels: Record<WorkoutPeriodType, string> = {
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};

export function normalizeDateRange(range: DateRange): DateRange {
  const start = startOfDay(range.start);
  const end = endOfDay(range.end);

  if (start.getTime() <= end.getTime()) {
    return { start, end };
  }

  return { start: startOfDay(range.end), end: endOfDay(range.start) };
}

export function getPeriodBounds(period: WorkoutPeriod) {
  if (period.type === "custom") {
    return normalizeDateRange({ start: period.start, end: period.end });
  }

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

export function filterWorkoutsByRange(workouts: Workout[], range: DateRange) {
  const { start, end } = normalizeDateRange(range);

  return workouts.filter((workout) =>
    isWithinInterval(workout.date, { start, end }),
  );
}

export function formatPeriodLabel(period: WorkoutPeriod) {
  const { start, end } = getPeriodBounds(period);

  if (period.type === "week" || period.type === "custom") {
    return `${format(start, "d MMM", { locale: ru })} — ${format(end, "d MMM yyyy", { locale: ru })}`;
  }

  if (period.type === "month") {
    return format(start, "LLLL yyyy", { locale: ru });
  }

  return format(start, "yyyy", { locale: ru });
}

export function formatDateRangeLabel(range: DateRange) {
  const { start, end } = normalizeDateRange(range);
  return `${format(start, "d MMM", { locale: ru })} — ${format(end, "d MMM yyyy", { locale: ru })}`;
}

export function shiftPeriod(period: WorkoutPeriod, direction: -1 | 1): WorkoutPeriod {
  if (period.type === "custom") {
    return period;
  }

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

export function isDateInRange(date: Date, range: DateRange) {
  const { start, end } = normalizeDateRange(range);
  return isWithinInterval(date, { start, end });
}

export function getCalendarMonthForPeriod(period: WorkoutPeriod) {
  if (period.type === "custom") {
    return startOfMonth(period.start);
  }

  if (period.type === "year") {
    return startOfYear(period.anchor);
  }

  return startOfMonth(period.anchor);
}

export function periodToDateRange(period: WorkoutPeriod): DateRange {
  const { start, end } = getPeriodBounds(period);
  return { start, end };
}
