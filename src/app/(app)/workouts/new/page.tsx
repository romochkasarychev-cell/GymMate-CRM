import Link from "next/link";
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
import { cn } from "@/lib/utils";
import { exercises } from "@/lib/mock-data";

export default function NewWorkoutPage() {
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
        title="Новая тренировка"
        description="Добавьте упражнения, вес и количество повторов"
      />

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Сессия
          </CardTitle>
          <CardDescription>Заполните подходы по каждому упражнению</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutForm exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  );
}
