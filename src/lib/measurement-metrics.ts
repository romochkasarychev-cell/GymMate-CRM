import {
  buildBaselineBodyMetrics,
  consolidateMetricsByDay,
  isStartAnchorMetric,
  normalizeReadingDate,
  normalizeStartDate,
  recordCurrentMetric,
  upsertStartMetric,
} from "@/lib/body-metrics";
import type { BodyMeasurements, MeasurementMetric, Profile } from "@/lib/types";
import {
  MEASUREMENT_FIELD_KEYS,
  emptyBodyMeasurements,
  type MeasurementFieldKey,
} from "@/lib/measurements";

function toBodyMetric(metric: MeasurementMetric) {
  return { date: metric.date, weight: metric.value };
}

function fromBodyMetric(
  metric: { date: Date; weight: number },
  kind: MeasurementFieldKey,
): MeasurementMetric {
  return { date: metric.date, kind, value: metric.weight };
}

function sortMetrics(metrics: MeasurementMetric[]) {
  return [...metrics].sort(
    (a, b) => a.date.getTime() - b.date.getTime() || a.kind.localeCompare(b.kind),
  );
}

export function consolidateKindMetrics(
  metrics: MeasurementMetric[],
  kind: MeasurementFieldKey,
) {
  const kindMetrics = metrics.filter((metric) => metric.kind === kind).map(toBodyMetric);
  return consolidateMetricsByDay(kindMetrics).map((metric) =>
    fromBodyMetric(metric, kind),
  );
}

export function consolidateMeasurementMetrics(
  metrics: MeasurementMetric[],
): MeasurementMetric[] {
  return sortMetrics(
    MEASUREMENT_FIELD_KEYS.flatMap((kind) => consolidateKindMetrics(metrics, kind)),
  );
}

/** Убирает дневные записи до даты регистрации / стартового якоря (8:00). */
export function sanitizeMeasurementMetrics(
  metrics: MeasurementMetric[],
  registeredAt: Date,
): MeasurementMetric[] {
  const registrationDay = normalizeStartDate(registeredAt);

  return sortMetrics(
    MEASUREMENT_FIELD_KEYS.flatMap((kind) => {
      const consolidated = consolidateKindMetrics(metrics, kind);
      if (consolidated.length === 0) {
        return [];
      }

      const startAnchor = consolidated.find((metric) =>
        isStartAnchorMetric(toBodyMetric(metric)),
      );
      const cutoff = startAnchor
        ? normalizeStartDate(startAnchor.date)
        : registrationDay;

      return consolidated.filter((metric) => {
        if (isStartAnchorMetric(toBodyMetric(metric))) {
          return true;
        }

        return normalizeReadingDate(metric.date).getTime() >= cutoff.getTime();
      });
    }),
  );
}

export function buildBaselineForKind(
  startValue: number,
  currentValue: number,
  kind: MeasurementFieldKey,
  startDate: Date,
  currentDate = new Date(),
): MeasurementMetric[] {
  const baseline = buildBaselineBodyMetrics(
    { startWeight: startValue, currentWeight: currentValue },
    startDate,
    currentDate,
  );

  return baseline.map((metric) => fromBodyMetric(metric, kind));
}

export function buildAllBaselineMeasurementMetrics(
  profile: Pick<Profile, "startMeasurements" | "currentMeasurements">,
  startDate: Date,
  currentDate = new Date(),
): MeasurementMetric[] {
  return sortMetrics(
    MEASUREMENT_FIELD_KEYS.flatMap((kind) =>
      buildBaselineForKind(
        profile.startMeasurements[kind],
        profile.currentMeasurements[kind],
        kind,
        startDate,
        currentDate,
      ),
    ),
  );
}

export function deriveCurrentMeasurementsFromMetrics(
  metrics: MeasurementMetric[],
): BodyMeasurements {
  const result = emptyBodyMeasurements();
  const consolidated = consolidateMeasurementMetrics(metrics);

  for (const kind of MEASUREMENT_FIELD_KEYS) {
    const kindMetrics = consolidated.filter((metric) => metric.kind === kind);
    const latestCurrent = kindMetrics
      .filter((metric) => !isStartAnchorMetric(toBodyMetric(metric)))
      .at(-1);
    const latest = latestCurrent ?? kindMetrics.at(-1);

    if (latest && latest.value > 0) {
      result[kind] = latest.value;
    }
  }

  return result;
}

export type MeasurementMetricUpdateOptions = {
  previousStartMeasurement?: {
    key: MeasurementFieldKey;
    value: number;
  };
  previousCurrentMeasurement?: {
    key: MeasurementFieldKey;
    value: number;
  };
  measurementUpdate?: {
    scope: "start" | "current";
    key: MeasurementFieldKey;
    previousValue: number;
  };
};

function resolveMeasurementUpdateOptions(
  options: MeasurementMetricUpdateOptions,
) {
  const previousStartMeasurement =
    options.previousStartMeasurement ??
    (options.measurementUpdate?.scope === "start"
      ? {
          key: options.measurementUpdate.key,
          value: options.measurementUpdate.previousValue,
        }
      : undefined);

  const previousCurrentMeasurement =
    options.previousCurrentMeasurement ??
    (options.measurementUpdate?.scope === "current"
      ? {
          key: options.measurementUpdate.key,
          value: options.measurementUpdate.previousValue,
        }
      : undefined);

  return { previousStartMeasurement, previousCurrentMeasurement };
}

export function applyMeasurementMetricUpdates(
  metrics: MeasurementMetric[],
  profile: Pick<Profile, "startMeasurements" | "currentMeasurements">,
  existingStart: BodyMeasurements,
  startDate: Date,
  options: MeasurementMetricUpdateOptions = {},
): { metrics: MeasurementMetric[]; changed: boolean } {
  const { previousStartMeasurement, previousCurrentMeasurement } =
    resolveMeasurementUpdateOptions(options);

  let next = metrics;
  let changed = false;

  const syncStartFields =
    previousStartMeasurement !== undefined || previousCurrentMeasurement === undefined;

  if (syncStartFields) {
    for (const key of MEASUREMENT_FIELD_KEYS) {
      const existingValue = existingStart[key];
      const profileValue = profile.startMeasurements[key];
      const startChanged =
        previousStartMeasurement?.key === key
          ? profileValue !== previousStartMeasurement.value
          : existingValue !== profileValue;

      if (startChanged) {
        next = upsertStartMeasurementMetric(next, key, profileValue, startDate);
        changed = true;
      }
    }
  }

  if (previousCurrentMeasurement) {
    const { key, value: previousValue } = previousCurrentMeasurement;
    const nextValue = profile.currentMeasurements[key];

    if (nextValue !== previousValue) {
      next = recordCurrentMeasurementMetric(next, key, nextValue);
      changed = true;
    }
  }

  return { metrics: next, changed };
}

export function upsertStartMeasurementMetric(
  metrics: MeasurementMetric[],
  kind: MeasurementFieldKey,
  value: number,
  startDate: Date,
) {
  const others = metrics.filter((metric) => metric.kind !== kind);
  const kindMetrics = metrics.filter((metric) => metric.kind === kind).map(toBodyMetric);
  const nextKindMetrics = upsertStartMetric(kindMetrics, value, startDate).map((metric) =>
    fromBodyMetric(metric, kind),
  );

  return sortMetrics([...others, ...nextKindMetrics]);
}

export function recordCurrentMeasurementMetric(
  metrics: MeasurementMetric[],
  kind: MeasurementFieldKey,
  value: number,
) {
  const others = metrics.filter((metric) => metric.kind !== kind);
  const kindMetrics = metrics.filter((metric) => metric.kind === kind).map(toBodyMetric);
  const nextKindMetrics = recordCurrentMetric(kindMetrics, value).map((metric) =>
    fromBodyMetric(metric, kind),
  );

  return sortMetrics([...others, ...nextKindMetrics]);
}

export function isStartAnchorMeasurementPoint(
  metric: MeasurementMetric,
  profile: Pick<Profile, "startMeasurements">,
) {
  return (
    profile.startMeasurements[metric.kind] > 0 &&
    metric.value === profile.startMeasurements[metric.kind] &&
    isStartAnchorMetric(toBodyMetric(metric))
  );
}

export function getMeasurementDelta(
  start: BodyMeasurements,
  current: BodyMeasurements,
  key: MeasurementFieldKey,
) {
  const startValue = start[key];
  const currentValue = current[key];

  if (startValue <= 0 || currentValue <= 0) {
    return null;
  }

  return Math.round((currentValue - startValue) * 10) / 10;
}
