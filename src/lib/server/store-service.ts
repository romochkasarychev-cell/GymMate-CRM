import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type {
  BodyMetric,
  Exercise,
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

function mapProfile(user: {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  goal: Profile["goal"];
  startWeight: number;
  currentWeight: number;
}): Profile {
  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    goal: user.goal,
    startWeight: user.startWeight,
    currentWeight: user.currentWeight,
  };
}

export async function loadUserStore(userId: string) {
  const [user, workouts, bodyMetrics, exercises] = await Promise.all([
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
    prisma.exercise.findMany({ orderBy: [{ muscleGroup: "asc" }, { name: "asc" }] }),
  ]);

  return {
    profile: mapProfile(user),
    workouts: workouts.map(mapWorkout),
    bodyMetrics: bodyMetrics.map(
      (metric): BodyMetric => ({
        date: metric.date,
        weight: metric.weight,
      }),
    ),
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
