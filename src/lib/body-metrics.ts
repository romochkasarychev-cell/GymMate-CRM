import type { BodyMetric, Profile } from "@/lib/types";

/** Стартовая точка — начало дня регистрации. */
export function normalizeStartDate(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(8, 0, 0, 0);
  return normalized;
}

/** Дневные взвешивания — полдень. */
export function normalizeReadingDate(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
}

/** @deprecated Используйте normalizeReadingDate или normalizeStartDate */
export function normalizeMetricDate(date: Date) {
  return normalizeReadingDate(date);
}

function sortMetrics(metrics: BodyMetric[]) {
  return [...metrics].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function isStartAnchorMetric(metric: BodyMetric) {
  const date = new Date(metric.date);
  return date.getHours() === 8 && date.getMinutes() === 0 && date.getSeconds() === 0;
}

export function findStartAnchorIndex(metrics: BodyMetric[]) {
  if (metrics.length === 0) {
    return -1;
  }

  const markedStart = metrics.findIndex(isStartAnchorMetric);
  if (markedStart >= 0) {
    return markedStart;
  }

  return metrics.reduce(
    (minIndex, metric, index, items) =>
      metric.date.getTime() < items[minIndex].date.getTime() ? index : minIndex,
    0,
  );
}

function consolidateDailyOnly(metrics: BodyMetric[]) {
  const byDay = new Map<string, BodyMetric>();

  for (const metric of sortMetrics(metrics)) {
    if (isStartAnchorMetric(metric)) {
      continue;
    }

    const date = normalizeReadingDate(metric.date);
    byDay.set(date.toDateString(), { date, weight: metric.weight });
  }

  return sortMetrics([...byDay.values()]);
}

function mergeStartAnchorWithDaily(
  startAnchor: BodyMetric | null,
  daily: BodyMetric[],
) {
  if (!startAnchor) {
    return daily;
  }

  return sortMetrics([
    { date: normalizeStartDate(startAnchor.date), weight: startAnchor.weight },
    ...daily,
  ]);
}

export function consolidateMetricsByDay(metrics: BodyMetric[]): BodyMetric[] {
  const sorted = sortMetrics(metrics);
  const startIndex = findStartAnchorIndex(sorted);

  if (startIndex < 0) {
    return consolidateDailyOnly(sorted);
  }

  const startAnchor = sorted[startIndex];
  const rest = sorted.filter((_, index) => index !== startIndex);

  return mergeStartAnchorWithDaily(startAnchor, consolidateDailyOnly(rest));
}

export function buildBaselineBodyMetrics(
  profile: Pick<Profile, "startWeight" | "currentWeight">,
  startDate: Date,
  currentDate = new Date(),
): BodyMetric[] {
  const metrics: BodyMetric[] = [];

  if (profile.startWeight > 0) {
    metrics.push({
      date: normalizeStartDate(startDate),
      weight: profile.startWeight,
    });
  }

  if (profile.currentWeight > 0) {
    const readingDate = normalizeReadingDate(currentDate);
    const startDateNormalized = normalizeStartDate(startDate);

    if (
      profile.startWeight <= 0 ||
      readingDate.toDateString() !== startDateNormalized.toDateString() ||
      profile.currentWeight !== profile.startWeight
    ) {
      metrics.push({
        date: readingDate,
        weight: profile.currentWeight,
      });
    }
  }

  return consolidateMetricsByDay(metrics);
}

export function upsertStartMetric(
  metrics: BodyMetric[],
  startWeight: number,
  startDate: Date,
): BodyMetric[] {
  const sorted = sortMetrics(metrics);
  const startIndex = findStartAnchorIndex(sorted);

  const rest =
    startIndex >= 0 ? sorted.filter((_, index) => index !== startIndex) : sorted;

  return mergeStartAnchorWithDaily(
    { date: normalizeStartDate(startDate), weight: startWeight },
    consolidateDailyOnly(rest),
  );
}

export function recordCurrentMetric(metrics: BodyMetric[], currentWeight: number) {
  const sorted = sortMetrics(metrics);
  const explicitStartIndex = sorted.findIndex(isStartAnchorMetric);
  const startAnchor = explicitStartIndex >= 0 ? sorted[explicitStartIndex] : null;
  const rest =
    explicitStartIndex >= 0
      ? sorted.filter((_, index) => index !== explicitStartIndex)
      : sorted;

  const today = normalizeReadingDate(new Date());
  const todayKey = today.toDateString();
  const daily = consolidateDailyOnly(rest);
  const existingToday = daily.find((metric) => metric.date.toDateString() === todayKey);

  if (existingToday?.weight === currentWeight) {
    return mergeStartAnchorWithDaily(startAnchor, daily);
  }

  const nextDaily = [
    ...daily.filter((metric) => metric.date.toDateString() !== todayKey),
    { date: today, weight: currentWeight },
  ];

  return mergeStartAnchorWithDaily(startAnchor, nextDaily);
}

export function isStartAnchorChartPoint(
  metric: BodyMetric,
  profile: Pick<Profile, "startWeight">,
) {
  return profile.startWeight > 0 && isStartAnchorMetric(metric);
}
