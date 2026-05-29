"use client";

import { useMemo, useState } from "react";
import { Library, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { addExercise } from "@/lib/gymmate-storage";
import { muscleGroupLabels, muscleGroupOptions } from "@/lib/labels";
import type { MuscleGroup } from "@/lib/types";

export function ReferencesView() {
  const { exercises } = useGymmateStore();
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("CHEST");
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const exercisesByGroup = useMemo(() => {
    return muscleGroupOptions.reduce<Record<MuscleGroup, typeof exercises>>(
      (acc, group) => {
        acc[group] = exercises
          .filter((exercise) => exercise.muscleGroup === group)
          .sort((a, b) => a.name.localeCompare(b.name, "ru"));
        return acc;
      },
      {} as Record<MuscleGroup, typeof exercises>,
    );
  }, [exercises]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    const added = addExercise(name, muscleGroup);
    if (!added) {
      setFormError("Введите название. Такое упражнение в этой группе уже есть.");
      return;
    }

    setName("");
    setFormError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Справочники"
        description="Упражнения для тренировок по группам мышц"
      />

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xl font-normal uppercase tracking-wide">
            <Plus className="size-5 text-primary" />
            Добавить упражнение
          </CardTitle>
          <CardDescription>
            Новое упражнение сразу появится в селекте при создании тренировки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Название</Label>
              <Input
                id="exercise-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFormError(null);
                }}
                placeholder="Например, жим гантелей лёжа"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exercise-group">Группа мышц</Label>
              <Select
                value={muscleGroup}
                onValueChange={(value) => {
                  if (value) setMuscleGroup(value as MuscleGroup);
                }}
              >
                <SelectTrigger id="exercise-group" className="w-full">
                  <SelectValue placeholder="Выберите группу">
                    {muscleGroupLabels[muscleGroup]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {muscleGroupOptions.map((group) => (
                    <SelectItem key={group} value={group}>
                      {muscleGroupLabels[group]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="gym-btn-primary h-9 w-full px-4 sm:w-auto">
              Добавить
            </Button>
          </form>

          {formError ? (
            <p className="mt-3 text-sm text-destructive">{formError}</p>
          ) : null}
          {saved ? (
            <p className="mt-3 text-sm text-primary">Упражнение добавлено</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {muscleGroupOptions.map((group) => {
          const groupExercises = exercisesByGroup[group];

          return (
            <Card
              key={group}
              className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm"
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-heading text-lg font-normal uppercase tracking-wide">
                  <Library className="size-4 text-primary" />
                  {muscleGroupLabels[group]}
                </CardTitle>
                <CardDescription>
                  {groupExercises.length > 0
                    ? `${groupExercises.length} упражнений`
                    : "Пока нет упражнений"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupExercises.length > 0 ? (
                  <ul className="space-y-2">
                    {groupExercises.map((exercise) => (
                      <li
                        key={exercise.id}
                        className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-2 text-sm"
                      >
                        {exercise.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Добавьте первое упражнение для этой группы
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
