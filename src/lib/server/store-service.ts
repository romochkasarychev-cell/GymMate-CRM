import type { Prisma } from "@/generated/prisma";
import { consolidateMetricsByDay } from "@/lib/body-metrics";
import { consolidateMeasurementMetrics, sanitizeMeasurementMetrics } from "@/lib/measurement-metrics";
import { MEASUREMENT_KIND_TO_FIELD, currentMeasurementsToUserData, hasAnyMeasurement } from "@/lib/measurements";
import {
  mapUserToProfile,
  resolveProfileMeasurements,
} from "@/lib/profile-mapper";
import { prisma } from "@/lib/prisma";
import { replaceMeasurementMetrics } from "@/lib/server/profile-service";
import type {
  BodyMetric,
  Exercise,
  MeasurementMetric,
  Profile,
  Workout,
  WorkoutSet,
} from "@/lib/types";

const workoutInclude = {
  sets: {
    orderBy: [{ exerciseId: "asc" as const }, { setNumber: "asc" as const }],
  },
} satisfies Prisma.WorkoutInclude;

function mapWorkout(
  workout: Prisma.WorkoutGetPayload<{ include: typeof workoutInclude }>,
): Workout {
  return {
    id: workout.id,
    date: workout.date,
    label: workout.label,
    notes: workout.notes ?? undefined,
    sets: workout.sets.map(
      (set): WorkoutSet => ({
        id: set.id,
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
      }),
    ),
  };
}

function mapProfile(user: Parameters<typeof mapUserToProfile>[0]): Profile {
  return mapUserToProfile(user);
}

export async function loadUserStore(userId: string) {
  const [user, workouts, bodyMetrics, measurementMetrics, exercises] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.workout.findMany({
      where: { userId },
      include: workoutInclude,
      orderBy: { date: "desc" },
    }),
    prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    }),
    prisma.measurementMetric.findMany({
      where: { userId },
      orderBy: [{ date: "asc" }, { kind: "asc" }],
    }),
    prisma.exercise.findMany({ orderBy: [{ muscleGroup: "asc" }, { name: "asc" }] }),
  ]);

  const consolidatedMeasurementMetrics = consolidateMeasurementMetrics(
    measurementMetrics.map(
      (metric): MeasurementMetric => ({
        date: metric.date,
        kind: MEASUREMENT_KIND_TO_FIELD[metric.kind],
        value: metric.value,
      }),
    ),
  );
  const mappedMeasurementMetrics = sanitizeMeasurementMetrics(
    consolidatedMeasurementMetrics,
    user.createdAt,
  );

  if (mappedMeasurementMetrics.length !== consolidatedMeasurementMetrics.length) {
    await replaceMeasurementMetrics(userId, mappedMeasurementMetrics);
  }

  const baseProfile = mapProfile(user);
  const profile = resolveProfileMeasurements(
    baseProfile,
    mappedMeasurementMetrics,
  );

  if (
    !hasAnyMeasurement(baseProfile.currentMeasurements) &&
    hasAnyMeasurement(profile.currentMeasurements)
  ) {
    await prisma.user.update({
      where: { id: userId },
      data: currentMeasurementsToUserData(profile.currentMeasurements),
    });
  }

  return {
    profile,
    workouts: workouts.map(mapWorkout),
    bodyMetrics: consolidateMetricsByDay(
      bodyMetrics.map(
        (metric): BodyMetric => ({
          date: metric.date,
          weight: metric.weight,
        }),
      ),
    ),
    measurementMetrics: mappedMeasurementMetrics,
    exercises: exercises.map(
      (exercise): Exercise => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        instructions: exercise.instructions ?? undefined,
      }),
    ),
  };
}

export { mapWorkout, workoutInclude };
