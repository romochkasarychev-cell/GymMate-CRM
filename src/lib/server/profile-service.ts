import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import {
  recordCurrentMetric,
  buildBaselineBodyMetrics,
  upsertStartMetric,
} from "@/lib/body-metrics";
import {
  MEASUREMENT_KIND_TO_FIELD,
  PRISMA_MEASUREMENT_KIND,
} from "@/lib/measurements";
import {
  applyMeasurementMetricUpdates,
  buildAllBaselineMeasurementMetrics,
  consolidateMeasurementMetrics,
  type MeasurementMetricUpdateOptions,
} from "@/lib/measurement-metrics";
import { mapUserStartMeasurements, mapUserToProfile, profileToUserUpdateData, resolveProfileMeasurements } from "@/lib/profile-mapper";
import type { BodyMetric, MeasurementMetric, Profile } from "@/lib/types";

export type ProfileUpdateOptions = {
  previousWeight?: number;
  previousStartWeight?: number;
} & MeasurementMetricUpdateOptions;

function mapBodyMetric(metric: { date: Date; weight: number }): BodyMetric {
  return {
    date: metric.date,
    weight: metric.weight,
  };
}

function mapMeasurementMetric(metric: {
  date: Date;
  kind: keyof typeof MEASUREMENT_KIND_TO_FIELD;
  value: number;
}): MeasurementMetric {
  return {
    date: metric.date,
    kind: MEASUREMENT_KIND_TO_FIELD[metric.kind],
    value: metric.value,
  };
}

async function listBodyMetrics(userId: string) {
  const metrics = await prisma.bodyMetric.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  return metrics.map(mapBodyMetric);
}

async function listMeasurementMetrics(userId: string) {
  const metrics = await prisma.measurementMetric.findMany({
    where: { userId },
    orderBy: [{ date: "asc" }, { kind: "asc" }],
  });

  return consolidateMeasurementMetrics(metrics.map(mapMeasurementMetric));
}

async function replaceBodyMetrics(userId: string, metrics: BodyMetric[]) {
  await prisma.bodyMetric.deleteMany({ where: { userId } });

  for (const metric of metrics) {
    await prisma.bodyMetric.create({
      data: {
        userId,
        date: metric.date,
        weight: metric.weight,
      },
    });
  }
}

async function replaceMeasurementMetrics(
  userId: string,
  metrics: MeasurementMetric[],
) {
  await prisma.measurementMetric.deleteMany({ where: { userId } });

  for (const metric of metrics) {
    await prisma.measurementMetric.create({
      data: {
        userId,
        date: metric.date,
        kind: PRISMA_MEASUREMENT_KIND[metric.kind],
        value: metric.value,
      },
    });
  }
}

export async function resetBodyMetrics(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  const baseline = buildBaselineBodyMetrics(
    {
      startWeight: user.startWeight,
      currentWeight: user.currentWeight,
    },
    user.createdAt,
  );

  await replaceBodyMetrics(userId, baseline);
  return baseline;
}

export async function updateProfile(
  userId: string,
  profile: Profile,
  options: ProfileUpdateOptions = {},
) {
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw ApiErrors.notFound("User not found");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: profileToUserUpdateData(profile),
  });

  const { previousWeight, previousStartWeight, ...measurementOptions } = options;
  let metrics = await listBodyMetrics(userId);
  let measurementMetrics = await listMeasurementMetrics(userId);

  if (metrics.length === 0) {
    metrics = buildBaselineBodyMetrics(profile, existing.createdAt);
    await replaceBodyMetrics(userId, metrics);
  }

  if (measurementMetrics.length === 0) {
    measurementMetrics = buildAllBaselineMeasurementMetrics(profile, existing.createdAt);
    await replaceMeasurementMetrics(userId, measurementMetrics);
  }

  let metricsChanged = false;
  let measurementMetricsChanged = false;

  const startWeightChanged =
    previousStartWeight !== undefined
      ? profile.startWeight !== previousStartWeight
      : existing.startWeight !== profile.startWeight;

  if (startWeightChanged) {
    metrics = upsertStartMetric(metrics, profile.startWeight, existing.createdAt);
    metricsChanged = true;
  }

  if (previousWeight !== undefined && profile.currentWeight !== previousWeight) {
    metrics = recordCurrentMetric(metrics, profile.currentWeight);
    metricsChanged = true;
  }

  const measurementSync = applyMeasurementMetricUpdates(
    measurementMetrics,
    profile,
    mapUserStartMeasurements(existing),
    existing.createdAt,
    measurementOptions,
  );

  if (measurementSync.changed) {
    measurementMetrics = measurementSync.metrics;
    measurementMetricsChanged = true;
  }

  if (metricsChanged) {
    metrics.sort((a, b) => a.date.getTime() - b.date.getTime());
    await replaceBodyMetrics(userId, metrics);
  }

  if (measurementMetricsChanged) {
    await replaceMeasurementMetrics(userId, measurementMetrics);
  }

  return resolveProfileMeasurements(mapUserToProfile(user), measurementMetrics);
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  const measurementMetrics = await listMeasurementMetrics(userId);
  return resolveProfileMeasurements(mapUserToProfile(user), measurementMetrics);
}

export { listMeasurementMetrics, replaceMeasurementMetrics };
