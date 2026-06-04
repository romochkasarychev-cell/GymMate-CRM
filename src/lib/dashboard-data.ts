import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { consolidateMetricsByDay, isStartAnchorChartPoint } from "@/lib/body-metrics";
import { calculateVolume, formatShortDate } from "@/lib/labels";
import {
  consolidateKindMetrics,
  isStartAnchorMeasurementPoint,
} from "@/lib/measurement-metrics";
import {
  MEASUREMENT_FIELD_KEYS,
  measurementFieldLabels,
  type MeasurementFieldKey,
} from "@/lib/measurements";
import type { BodyMetric, MeasurementMetric, Profile, Workout } from "@/lib/types";
import {
  filterWorkoutsByPeriod,
  formatPeriodLabel,
  type WorkoutPeriodType,
} from "@/lib/workout-period";

function getWorkoutCountForPeriod(workouts: Workout[], type: WorkoutPeriodType, anchor: Date) {
  return filterWorkoutsByPeriod(workouts, { type, anchor }).length;
}

export function buildWeightChartData(bodyMetrics: BodyMetric[], profile: Profile) {
  const daily = consolidateMetricsByDay(bodyMetrics);

  if (daily.length === 0) {
    const points: { label: string; timestamp: number; weight: number }[] = [];
    let timestamp = Date.now() - 86_400_000;

    if (profile.startWeight > 0) {
      points.push({ label: "Старт", timestamp, weight: profile.startWeight });
      timestamp += 86_400_000;
    }

    if (profile.currentWeight > 0) {
      const lastPoint = points.at(-1);
      if (!lastPoint || lastPoint.weight !== profile.currentWeight) {
        points.push({ label: "Сейчас", timestamp, weight: profile.currentWeight });
      }
    }

    return points;
  }

  return daily.map((metric, index) => {
    const isStart = isStartAnchorChartPoint(metric, profile);

    return {
      label: isStart
        ? `${formatShortDate(metric.date)} · старт`
        : formatShortDate(metric.date),
      timestamp: metric.date.getTime() + index,
      weight: metric.weight,
    };
  });
}

export type MeasurementChartPoint = {
  label: string;
  timestamp: number;
  value: number;
};

export type MeasurementChartSeries = {
  key: MeasurementFieldKey;
  title: string;
  data: MeasurementChartPoint[];
};

export function buildMeasurementChartData(
  metrics: MeasurementMetric[],
  kind: MeasurementFieldKey,
  profile: Profile,
): MeasurementChartPoint[] {
  const daily = consolidateKindMetrics(metrics, kind);
  const startValue = profile.startMeasurements[kind];
  const currentValue = profile.currentMeasurements[kind];

  if (daily.length === 0) {
    const points: MeasurementChartPoint[] = [];
    let timestamp = Date.now() - 86_400_000;

    if (startValue > 0) {
      points.push({ label: "Старт", timestamp, value: startValue });
      timestamp += 86_400_000;
    }

    if (currentValue > 0) {
      const lastPoint = points.at(-1);
      if (!lastPoint || lastPoint.value !== currentValue) {
        points.push({ label: "Сейчас", timestamp, value: currentValue });
      }
    }

    return points;
  }

  return daily.map((metric, index) => {
    const isStart = isStartAnchorMeasurementPoint(metric, profile);

    return {
      label: isStart
        ? `${formatShortDate(metric.date)} · старт`
        : formatShortDate(metric.date),
      timestamp: metric.date.getTime() + index,
      value: metric.value,
    };
  });
}

export function buildMeasurementChartSeries(
  metrics: MeasurementMetric[],
  profile: Profile,
): MeasurementChartSeries[] {
  return MEASUREMENT_FIELD_KEYS.map((key) => ({
    key,
    title: measurementFieldLabels[key],
    data: buildMeasurementChartData(metrics, key, profile),
  })).filter((series) => series.data.length > 0);
}

export function getDashboardData(
  workouts: Workout[],
  bodyMetrics: BodyMetric[],
  measurementMetrics: MeasurementMetric[],
  profile: Profile,
) {
  const weightData = buildWeightChartData(bodyMetrics, profile);
  const measurementCharts = buildMeasurementChartSeries(measurementMetrics, profile);

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
    profile.currentWeight > 0
      ? profile.currentWeight
      : consolidateMetricsByDay(bodyMetrics).at(-1)?.weight ?? null;

  return {
    weightData,
    measurementCharts,
    volumeData,
    workoutPeriodCounts,
    stats: {
      totalWorkouts: workouts.length,
      totalVolume: Math.round(totalVolume),
      latestWeight,
    },
  };
}
