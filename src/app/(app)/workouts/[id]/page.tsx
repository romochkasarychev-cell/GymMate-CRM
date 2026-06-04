import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { WorkoutDetailView } from "@/components/workout-detail-view";
import { requireSessionUserFromCookies } from "@/lib/server/auth-user";
import { getWorkout } from "@/lib/server/workout-service";

type WorkoutDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const { id } = await params;

  if (process.env.NEXT_PUBLIC_USE_API === "true") {
    try {
      const user = await requireSessionUserFromCookies();
      const workout = await getWorkout(user.id, id);
      return <WorkoutDetailView id={id} initialWorkout={workout} />;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        redirect(`/login?from=/workouts/${id}`);
      }

      notFound();
    }
  }

  return <WorkoutDetailView id={id} />;
}
