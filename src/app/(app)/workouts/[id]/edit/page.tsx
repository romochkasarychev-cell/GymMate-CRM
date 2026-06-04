import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { requireSessionUserFromCookies } from "@/lib/server/auth-user";
import { getWorkout } from "@/lib/server/workout-service";
import { WorkoutEditView } from "@/components/workout-edit-view";

type WorkoutEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutEditPage({ params }: WorkoutEditPageProps) {
  const { id } = await params;

  if (process.env.NEXT_PUBLIC_USE_API === "true") {
    try {
      const user = await requireSessionUserFromCookies();
      const workout = await getWorkout(user.id, id);
      return <WorkoutEditView id={id} initialWorkout={workout} />;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        redirect(`/login?from=/workouts/${id}/edit`);
      }

      notFound();
    }
  }

  return <WorkoutEditView id={id} />;
}
