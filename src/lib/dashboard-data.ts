import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { calculateVolume, formatShortDate } from "@/lib/labels";
import type { BodyMetric, Profile, Workout } from "@/lib/types";
import {
  filterWorkoutsByPeriod,
  formatPeriodLabel,
  type WorkoutPeriodType,
} from "@/lib/workout-period";

function getWorkoutCountForPeriod(workouts: Workout[], type: WorkoutPeriodType, anchor: Date) {
  return filterWorkoutsByPeriod(workouts, { type, anchor }).length;
}

export function getDashboardData(
  workouts: Workout[],
  bodyMetrics: BodyMetric[],
  profile: Profile,
) {
  const weightData = bodyMetrics.map((metric) => ({
    date: formatShortDate(metric.date),
    weight: metric.weight,
  }));

  const volumeData = [...workouts]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6)
    .map((workout) => ({
      label: formatShortDate(workout.date),
      volume: Math.round(calculateVolume(workout.sets)),
    }));

  const now = new Date();

  const workoutPeriodCounts = {
    week: {
      count: getWorkoutCountForPeriod(workouts, "week", now),
      label: formatPeriodLabel({ type: "week", anchor: now }),
    },
    month: {
      count: getWorkoutCountForPeriod(workouts, "month", now),
      label: formatPeriodLabel({ type: "month", anchor: now }),
    },
    year: {
      count: getWorkoutCountForPeriod(workouts, "year", now),
      label: format(now, "yyyy", { locale: ru }),
    },
  };

  const totalVolume = workouts.reduce(
    (total, workout) => total + calculateVolume(workout.sets),
    0,
  );

  const latestWeight =
    bodyMetrics.at(-1)?.weight ?? profile.currentWeight ?? null;

  return {
    weightData,
    volumeData,
    workoutPeriodCounts,
    stats: {
      totalWorkouts: workouts.length,
      totalVolume: Math.round(totalVolume),
      latestWeight,
    },
  };
}
