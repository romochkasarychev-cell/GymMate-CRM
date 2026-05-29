"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addWorkout, createWorkout, updateWorkout } from "@/lib/gymmate-storage";
import { muscleGroupLabels, muscleGroupOptions, workoutLabelLabels, workoutLabelOptions } from "@/lib/labels";
import type { MuscleGroup, Workout, WorkoutLabel } from "@/lib/types";
import { useGymmateStore } from "@/hooks/use-gymmate-store";

type WorkoutSetInput = {
  id: string;
  weight: string;
  reps: string;
};

type ExerciseBlockInput = {
  id: string;
  exerciseId: string;
  sets: WorkoutSetInput[];
};

type WorkoutFormProps = {
  workout?: Workout;
};

function workoutToExerciseBlocks(workout: Workout): ExerciseBlockInput[] {
  const blocks: ExerciseBlockInput[] = [];
  const blockByExerciseId = new Map<string, ExerciseBlockInput>();

  for (const set of workout.sets) {
    let block = blockByExerciseId.get(set.exerciseId);

    if (!block) {
      block = {
        id: crypto.randomUUID(),
        exerciseId: set.exerciseId,
        sets: [],
      };
      blockByExerciseId.set(set.exerciseId, block);
      blocks.push(block);
    }

    block.sets.push({
      id: crypto.randomUUID(),
      weight: String(set.weight),
      reps: String(set.reps),
    });
  }

  return blocks;
}

function createInitialExerciseBlocks(
  workout: Workout | undefined,
  defaultExerciseId: string,
): ExerciseBlockInput[] {
  if (workout) {
    const blocks = workoutToExerciseBlocks(workout);
    return blocks.length > 0 ? blocks : [createExerciseBlock(defaultExerciseId)];
  }

  return [createExerciseBlock(defaultExerciseId)];
}

function createEmptySet(): WorkoutSetInput {
  return {
    id: crypto.randomUUID(),
    weight: "",
    reps: "",
  };
}

function createExerciseBlock(exerciseId = ""): ExerciseBlockInput {
  return {
    id: crypto.randomUUID(),
    exerciseId,
    sets: [createEmptySet()],
  };
}

export function WorkoutForm({ workout }: WorkoutFormProps) {
  const router = useRouter();
  const { exercises } = useGymmateStore();
  const defaultExerciseId = exercises[0]?.id ?? "";
  const isEditing = Boolean(workout);

  const [label, setLabel] = useState<WorkoutLabel>(workout?.label ?? "MEDIUM");
  const [notes, setNotes] = useState(workout?.notes ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlockInput[]>(() =>
    createInitialExerciseBlocks(workout, defaultExerciseId),
  );

  const exercisesByGroup = useMemo(() => {
    return muscleGroupOptions.reduce<Record<MuscleGroup, typeof exercises>>(
      (acc, group) => {
        acc[group] = exercises.filter((exercise) => exercise.muscleGroup === group);
        return acc;
      },
      {} as Record<MuscleGroup, typeof exercises>,
    );
  }, [exercises]);

  const exerciseNameById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.name])),
    [exercises],
  );

  function addExercise() {
    setExerciseBlocks((current) => [...current, createExerciseBlock()]);
    setFormError(null);
  }

  function removeExercise(blockId: string) {
    setExerciseBlocks((current) => current.filter((block) => block.id !== blockId));
  }

  function updateExercise(blockId: string, exerciseId: string) {
    setFormError(null);
    setExerciseBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? { ...block, exerciseId } : block,
      ),
    );
  }

  function addSet(blockId: string) {
    setExerciseBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? { ...block, sets: [...block.sets, createEmptySet()] }
          : block,
      ),
    );
  }

  function removeSet(blockId: string, setId: string) {
    setExerciseBlocks((current) =>
      current.map((block) => {
        if (block.id !== blockId) return block;

        const nextSets = block.sets.filter((set) => set.id !== setId);
        return {
          ...block,
          sets: nextSets.length > 0 ? nextSets : [createEmptySet()],
        };
      }),
    );
  }

  function updateSet(
    blockId: string,
    setId: string,
    field: keyof WorkoutSetInput,
    value: string,
  ) {
    setExerciseBlocks((current) =>
      current.map((block) =>
        block.id === blockId
          ? {
              ...block,
              sets: block.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set,
              ),
            }
          : block,
      ),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missingExercise = exerciseBlocks.some((block) => !block.exerciseId);
    if (missingExercise) {
      setFormError("Выберите упражнение для каждого блока.");
      return;
    }

    const flatSets = exerciseBlocks.flatMap((block) =>
      block.sets.map((set) => ({
        exerciseId: block.exerciseId,
        weight: set.weight,
        reps: set.reps,
      })),
    );

    const nextWorkout = createWorkout(
      label,
      notes,
      flatSets,
      exercises,
      workout ? { id: workout.id, date: workout.date } : undefined,
    );

    if (isEditing && workout) {
      updateWorkout(nextWorkout);
      router.push(`/workouts/${workout.id}`);
      return;
    }

    addWorkout(nextWorkout);
    router.push(`/workouts/${nextWorkout.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="label">Ярлык тренировки</Label>
        <Select
          value={label}
          onValueChange={(value) => {
            if (value) setLabel(value as WorkoutLabel);
          }}
        >
          <SelectTrigger id="label" className="w-full">
            <SelectValue placeholder="Выберите ярлык">
              {workoutLabelLabels[label]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {workoutLabelOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {workoutLabelLabels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Заметки</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Как прошла тренировка?"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-lg font-normal uppercase tracking-wide">
            Упражнения
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            onClick={addExercise}
          >
            <Dumbbell className="size-4" />
            Добавить упражнение
          </Button>
        </div>

        {exerciseBlocks.map((block, blockIndex) => (
          <div
            key={block.id}
            className="space-y-4 rounded-xl border border-border/70 bg-card/40 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`exercise-${block.id}`}>
                  Упражнение {blockIndex + 1}
                </Label>
                <Select
                  value={block.exerciseId || null}
                  onValueChange={(value) => {
                    if (value) updateExercise(block.id, value);
                  }}
                >
                  <SelectTrigger id={`exercise-${block.id}`} className="w-full">
                    <SelectValue placeholder="Выберите упражнение">
                      {block.exerciseId
                        ? exerciseNameById.get(block.exerciseId)
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {muscleGroupOptions.map((group) => {
                      const groupExercises = exercisesByGroup[group];
                      if (groupExercises.length === 0) return null;

                      return (
                        <div key={group}>
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            {muscleGroupLabels[group]}
                          </div>
                          {groupExercises.map((exercise) => (
                            <SelectItem key={exercise.id} value={exercise.id}>
                              {exercise.name}
                            </SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {exerciseBlocks.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeExercise(block.id)}
                >
                  <Trash2 className="size-4" />
                  Удалить упражнение
                </Button>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Подходы</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
                  onClick={() => addSet(block.id)}
                >
                  <Plus className="size-4" />
                  Добавить подход
                </Button>
              </div>

              {block.sets.map((set, setIndex) => (
                <div key={set.id} className="gym-set-card rounded-xl p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="gym-set-badge">{setIndex + 1}</span>
                    <span className="font-heading text-sm uppercase tracking-wide">
                      Подход {setIndex + 1}
                    </span>
                    {block.sets.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto shrink-0"
                        onClick={() => removeSet(block.id, set.id)}
                        aria-label={`Удалить подход ${setIndex + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : (
                      <div className="size-8 shrink-0" />
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`weight-${set.id}`}>Вес (кг)</Label>
                      <Input
                        id={`weight-${set.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight}
                        onChange={(event) =>
                          updateSet(block.id, set.id, "weight", event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`reps-${set.id}`}>Повторы</Label>
                      <Input
                        id={`reps-${set.id}`}
                        type="number"
                        min="1"
                        value={set.reps}
                        onChange={(event) =>
                          updateSet(block.id, set.id, "reps", event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Данные сохраняются локально в браузере.
      </p>

      <Button type="submit" className="gym-btn-primary h-9 w-full px-4 sm:w-auto">
        {isEditing ? "Сохранить изменения" : "Сохранить тренировку"}
      </Button>
    </form>
  );
}
