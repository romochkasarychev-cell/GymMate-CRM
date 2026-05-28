"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import { addWorkout, createWorkout } from "@/lib/gymmate-storage";
import { muscleGroupLabels } from "@/lib/labels";
import type { Exercise, MuscleGroup } from "@/lib/types";

type WorkoutSetInput = {
  id: string;
  exerciseId: string;
  weight: string;
  reps: string;
};

type WorkoutFormProps = {
  exercises: Exercise[];
};

export function WorkoutForm({ exercises }: WorkoutFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const [sets, setSets] = useState<WorkoutSetInput[]>([
    {
      id: crypto.randomUUID(),
      exerciseId: exercises[0]?.id ?? "",
      weight: "",
      reps: "",
    },
  ]);

  const exercisesByGroup = useMemo(() => {
    return exercises.reduce<Record<MuscleGroup, Exercise[]>>(
      (acc, exercise) => {
        acc[exercise.muscleGroup] ??= [];
        acc[exercise.muscleGroup].push(exercise);
        return acc;
      },
      {} as Record<MuscleGroup, Exercise[]>,
    );
  }, [exercises]);

  const setNumbers = useMemo(() => {
    const counters = new Map<string, number>();

    return sets.map((set) => {
      const number = (counters.get(set.exerciseId) ?? 0) + 1;
      counters.set(set.exerciseId, number);
      return number;
    });
  }, [sets]);

  function addSet() {
    setSets((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        exerciseId: exercises[0]?.id ?? "",
        weight: "",
        reps: "",
      },
    ]);
  }

  function removeSet(id: string) {
    setSets((current) => current.filter((set) => set.id !== id));
  }

  function updateSet(id: string, field: keyof WorkoutSetInput, value: string) {
    setSets((current) =>
      current.map((set) => (set.id === id ? { ...set, [field]: value } : set)),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const workout = createWorkout(notes, sets, exercises);
    addWorkout(workout);
    router.push(`/workouts/${workout.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-normal uppercase tracking-wide">Подходы</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            onClick={addSet}
          >
            <Plus className="size-4" />
            Добавить подход
          </Button>
        </div>

        {sets.map((set, index) => (
          <div key={set.id} className="gym-set-card rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="gym-set-badge">{setNumbers[index]}</span>
              <span className="font-heading text-sm uppercase tracking-wide">
                Подход {setNumbers[index]}
              </span>
              {sets.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto shrink-0"
                  onClick={() => removeSet(set.id)}
                  aria-label={`Удалить подход ${setNumbers[index]}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : (
                <div className="size-8 shrink-0" />
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label>Упражнение</Label>
                <Select
                  value={set.exerciseId}
                  onValueChange={(value) =>
                    updateSet(set.id, "exerciseId", value ?? exercises[0]?.id ?? "")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите упражнение" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(exercisesByGroup).map(([group, groupExercises]) => (
                      <div key={group}>
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          {muscleGroupLabels[group as MuscleGroup]}
                        </div>
                        {groupExercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Вес (кг)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={set.weight}
                  onChange={(event) => updateSet(set.id, "weight", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Повторы</Label>
                <Input
                  type="number"
                  min="1"
                  value={set.reps}
                  onChange={(event) => updateSet(set.id, "reps", event.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Данные сохраняются локально в браузере.
      </p>

      <Button type="submit" className="gym-btn-primary h-9 px-4">
        Сохранить тренировку
      </Button>
    </form>
  );
}
