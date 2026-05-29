"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { deleteWorkout } from "@/lib/gymmate-storage";
import { WorkoutLabelBadge } from "@/components/workout-label-badge";
import { calculateVolume, countWorkoutExercises, formatDate, formatExerciseCount } from "@/lib/labels";
import { cn } from "@/lib/utils";

type WorkoutDetailViewProps = {
  id: string;
};

export function WorkoutDetailView({ id }: WorkoutDetailViewProps) {
  const router = useRouter();
  const { workouts } = useGymmateStore();
  const workout = workouts.find((item) => item.id === id);

  if (!workout) {
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

  function handleDelete() {
    const confirmed = window.confirm(
      "Удалить эту тренировку? Действие нельзя отменить.",
    );

    if (!confirmed) return;

    if (deleteWorkout(workoutId)) {
      router.push("/workouts");
    }
  }

  return (
    <div className="space-y-8">
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
              onClick={handleDelete}
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
