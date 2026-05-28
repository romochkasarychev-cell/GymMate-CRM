"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { calculateVolume, formatDate } from "@/lib/labels";
import { cn } from "@/lib/utils";

type WorkoutDetailViewProps = {
  id: string;
};

export function WorkoutDetailView({ id }: WorkoutDetailViewProps) {
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
        description={`${workout.sets.length} подходов · ${volume} кг объём`}
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
                  className="gym-set-card flex items-center justify-between rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="gym-set-badge text-sm">{set.setNumber}</span>
                    <span className="text-sm text-muted-foreground">
                      Подход {set.setNumber}
                    </span>
                  </div>
                  <span className="font-heading text-lg tracking-wide">
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
