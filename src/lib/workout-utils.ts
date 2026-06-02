import type { Workout, WorkoutSet } from "@/lib/types";

type SetInput = {
  exerciseId: string;
  weight: string;
  reps: string;
};

export function buildWorkoutSets(
  sets: SetInput[],
  exercises: { id: string; name: string }[],
): WorkoutSet[] {
  const counters = new Map<string, number>();

  return sets.map((set) => {
    const exercise = exercises.find((item) => item.id === set.exerciseId);
    const setNumber = (counters.get(set.exerciseId) ?? 0) + 1;
    counters.set(set.exerciseId, setNumber);

    return {
      id: crypto.randomUUID(),
      exerciseId: set.exerciseId,
      exerciseName: exercise?.name ?? "Упражнение",
      setNumber,
      weight: Number.parseFloat(set.weight) || 0,
      reps: Number.parseInt(set.reps, 10) || 0,
    };
  });
}

export function createWorkoutFromInput(
  label: Workout["label"],
  notes: string,
  sets: SetInput[],
  exercises: { id: string; name: string }[],
  existing?: Pick<Workout, "id" | "date">,
): Workout {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    date: existing?.date ?? new Date(),
    label,
    notes: notes.trim() || undefined,
    sets: buildWorkoutSets(sets, exercises),
  };
}

export type WorkoutSetWriteInput = {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
};

export function flattenWorkoutBlocks(
  blocks: {
    exerciseId: string;
    sets: { weight: string; reps: string }[];
  }[],
): SetInput[] {
  return blocks.flatMap((block) =>
    block.sets.map((set) => ({
      exerciseId: block.exerciseId,
      weight: set.weight,
      reps: set.reps,
    })),
  );
}
