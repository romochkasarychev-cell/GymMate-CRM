import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import type { Exercise, MuscleGroup } from "@/lib/types";

export async function listExercises() {
  const exercises = await prisma.exercise.findMany({
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  return exercises.map(
    (exercise): Exercise => ({
      id: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      instructions: exercise.instructions ?? undefined,
    }),
  );
}

export async function addExercise(name: string, muscleGroup: MuscleGroup) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw ApiErrors.badRequest("Exercise name is required");
  }

  const existing = await prisma.exercise.findUnique({
    where: {
      name_muscleGroup: { name: trimmedName, muscleGroup },
    },
  });

  if (existing) {
    throw ApiErrors.conflict("Exercise already exists in this muscle group");
  }

  const exercise = await prisma.exercise.create({
    data: { name: trimmedName, muscleGroup },
  });

  return {
    id: exercise.id,
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    instructions: exercise.instructions ?? undefined,
  } satisfies Exercise;
}

export async function deleteExercise(id: string) {
  const exercise = await prisma.exercise.findUnique({ where: { id } });

  if (!exercise) {
    throw ApiErrors.notFound("Exercise not found");
  }

  const inUse = await prisma.workoutSet.findFirst({
    where: { exerciseId: id },
  });

  if (inUse) {
    throw ApiErrors.conflict("Exercise is used in workouts and cannot be deleted");
  }

  await prisma.exercise.delete({ where: { id } });
  return true;
}
