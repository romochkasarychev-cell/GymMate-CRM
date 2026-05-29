"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { WorkoutForm } from "@/components/workout-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGymmateStore } from "@/hooks/use-gymmate-store";
import { formatDate } from "@/lib/labels";
import { cn } from "@/lib/utils";

type WorkoutEditViewProps = {
  id: string;
};

export function WorkoutEditView({ id }: WorkoutEditViewProps) {
  const { workouts } = useGymmateStore();
  const workout = workouts.find((item) => item.id === id);

  if (!workout) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/workouts/${workout.id}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "px-0 text-muted-foreground hover:text-primary",
        )}
      >
        <ArrowLeft className="size-4" />
        К тренировке
      </Link>

      <PageHeader
        title="Редактирование тренировки"
        description={formatDate(workout.date)}
      />

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Сессия
          </CardTitle>
          <CardDescription>Измените упражнения, вес и количество повторов</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm workout={workout} />
        </CardContent>
      </Card>
    </div>
  );
}
