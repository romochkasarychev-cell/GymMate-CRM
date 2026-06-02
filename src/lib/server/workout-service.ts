import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import { mapWorkout, workoutInclude } from "@/lib/server/store-service";
import type { Workout, WorkoutLabel } from "@/lib/types";
import type { WorkoutSetWriteInput } from "@/lib/workout-utils";

type WorkoutInput = {
  label: WorkoutLabel;
  notes?: string;
  date?: Date;
  sets: WorkoutSetWriteInput[];
};

async function replaceWorkoutSets(workoutId: string, sets: WorkoutSetWriteInput[]) {
  await prisma.workoutSet.deleteMany({ where: { workoutId } });

  if (sets.length === 0) return;

  await prisma.workoutSet.createMany({
    data: sets.map((set) => ({
      workoutId,
      exerciseId: set.exerciseId,
      exerciseName: set.exerciseName,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps,
    })),
  });
}

export async function listWorkouts(userId: string) {
  const workouts = await prisma.workout.findMany({
    where: { userId },
    include: workoutInclude,
    orderBy: { date: "desc" },
  });

  return workouts.map(mapWorkout);
}

export async function getWorkout(userId: string, id: string) {
  const workout = await prisma.workout.findFirst({
    where: { id, userId },
    include: workoutInclude,
  });

  if (!workout) {
    throw ApiErrors.notFound("Workout not found");
  }

  return mapWorkout(workout);
}

export async function createWorkout(userId: string, input: WorkoutInput) {
  const workout = await prisma.workout.create({
    data: {
      userId,
      label: input.label,
      notes: input.notes,
      date: input.date ?? new Date(),
      sets: {
        create: input.sets.map((set) => ({
          exerciseId: set.exerciseId,
          exerciseName: set.exerciseName,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
        })),
      },
    },
    include: workoutInclude,
  });

  return mapWorkout(workout);
}

export async function updateWorkout(userId: string, id: string, input: WorkoutInput) {
  const existing = await prisma.workout.findFirst({ where: { id, userId } });

  if (!existing) {
    throw ApiErrors.notFound("Workout not found");
  }

  await prisma.workout.update({
    where: { id },
    data: {
      label: input.label,
      notes: input.notes,
      date: input.date ?? existing.date,
    },
  });

  await replaceWorkoutSets(id, input.sets);

  return getWorkout(userId, id);
}

export async function deleteWorkout(userId: string, id: string) {
  const existing = await prisma.workout.findFirst({ where: { id, userId } });

  if (!existing) {
    throw ApiErrors.notFound("Workout not found");
  }

  await prisma.workout.delete({ where: { id } });
  return true;
}

export function workoutInputFromClient(
  workout: Workout,
  exercises: { id: string; name: string }[],
): WorkoutInput {
  return {
    label: workout.label,
    notes: workout.notes,
    date: workout.date,
    sets: workout.sets.map((set) => ({
      exerciseId: set.exerciseId,
      exerciseName:
        set.exerciseName ??
        exercises.find((item) => item.id === set.exerciseId)?.name ??
        "Упражнение",
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps,
    })),
  };
}
