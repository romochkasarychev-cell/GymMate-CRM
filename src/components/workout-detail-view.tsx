"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWorkout } from "@/hooks/use-workout";
import { refreshGymmateStore } from "@/hooks/use-gymmate-store";
import { deleteWorkout } from "@/lib/gymmate-storage";
import { isApiEnabled, removeWorkout } from "@/lib/gymmate-api";
import { WorkoutLabelBadge } from "@/components/workout-label-badge";
import { calculateVolume, countWorkoutExercises, formatDate, formatExerciseCount } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Workout } from "@/lib/types";

type WorkoutDetailViewProps = {
  id: string;
  initialWorkout?: Workout;
};

export function WorkoutDetailView({ id, initialWorkout }: WorkoutDetailViewProps) {
  const router = useRouter();
  const { workout, loading, missing } = useWorkout(id, { initialWorkout });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-secondary/40" />
        <div className="h-10 w-72 animate-pulse rounded-lg bg-secondary/40" />
        <div className="h-48 animate-pulse rounded-xl bg-secondary/30" />
      </div>
    );
  }

  if (missing || !workout) {
    notFound();
  }

  const groupedSets = workout.sets.reduce<Record<string, typeof workout.sets>>(
    (acc, set) => {
      acc[set.exerciseName] ??= [];
      acc[set.exerciseName].push(set);
      return acc;
    },
    {},
  );

  const volume = Math.round(calculateVolume(workout.sets));
  const exerciseCount = countWorkoutExercises(workout.sets);
  const workoutId = workout.id;

  async function handleDeleteConfirm() {
    setDeleting(true);

    try {
      if (isApiEnabled()) {
        await removeWorkout(workoutId);
        refreshGymmateStore();
        router.push("/workouts");
        return;
      }

      if (deleteWorkout(workoutId)) {
        router.push("/workouts");
      }
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        open={deleteOpen}
        title="Удалить тренировку?"
        description="Действие нельзя отменить. Тренировка и все подходы будут удалены."
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />
      <Link
        href="/workouts"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "px-0 text-muted-foreground hover:text-primary",
        )}
      >
        <ArrowLeft className="size-4" />
        К списку тренировок
      </Link>

      <PageHeader
        title={formatDate(workout.date)}
        description={`${formatExerciseCount(exerciseCount)} · ${volume} кг объём`}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <WorkoutLabelBadge label={workout.label} />
            <Link
              href={`/workouts/${workout.id}/edit`}
              className={cn(buttonVariants({ variant: "outline" }), "border-primary/30")}
            >
              <Pencil className="size-4" />
              Редактировать
            </Link>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Удалить
            </Button>
          </div>
        }
      />

      {workout.notes ? (
        <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{workout.notes}&rdquo;
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {Object.entries(groupedSets).map(([exerciseName, sets]) => (
          <Card key={exerciseName} className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide">
                {exerciseName}
              </CardTitle>
              <CardDescription>{sets.length} подходов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className="gym-set-card flex flex-col gap-2 rounded-lg px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="gym-set-badge text-sm">{set.setNumber}</span>
                    <span className="text-sm text-muted-foreground">
                      Подход {set.setNumber}
                    </span>
                  </div>
                  <span className="font-heading text-base tracking-wide sm:text-lg">
                    <span className="text-primary">{set.weight}</span> кг
                    <span className="mx-2 text-muted-foreground">×</span>
                    {set.reps}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
