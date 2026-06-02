import type { GymmateStore } from "@/lib/gymmate-storage";
import type { MuscleGroup, Profile, Workout } from "@/lib/types";

export function isApiEnabled() {
  return process.env.NEXT_PUBLIC_USE_API === "true";
}

type ApiStoreResponse = {
  profile: Profile;
  workouts: Array<Omit<Workout, "date"> & { date: string }>;
  bodyMetrics: Array<{ date: string; weight: number }>;
  exercises: GymmateStore["exercises"];
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parseStore(data: ApiStoreResponse): GymmateStore {
  return {
    profile: data.profile,
    workouts: data.workouts.map((workout) => ({
      ...workout,
      date: new Date(workout.date),
    })),
    bodyMetrics: data.bodyMetrics.map((metric) => ({
      date: new Date(metric.date),
      weight: metric.weight,
    })),
    exercises: data.exercises,
  };
}

export async function fetchStore(): Promise<GymmateStore> {
  const data = await parseJson<ApiStoreResponse>(await fetch("/api/store"));
  return parseStore(data);
}

export async function patchProfile(profile: Profile, previousWeight?: number) {
  const data = await parseJson<{ profile: Profile }>(
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, previousWeight }),
    }),
  );

  return data.profile;
}

export async function postWorkout(
  workout: Workout,
  exercises: { id: string; name: string }[],
) {
  const data = await parseJson<{ workout: ApiStoreResponse["workouts"][number] }>(
    await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workout, exercises }),
    }),
  );

  return {
    ...data.workout,
    date: new Date(data.workout.date),
  } satisfies Workout;
}

export async function patchWorkout(
  workout: Workout,
  exercises: { id: string; name: string }[],
) {
  const data = await parseJson<{ workout: ApiStoreResponse["workouts"][number] }>(
    await fetch(`/api/workouts/${workout.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workout, exercises }),
    }),
  );

  return {
    ...data.workout,
    date: new Date(data.workout.date),
  } satisfies Workout;
}

export async function removeWorkout(id: string) {
  await parseJson<{ ok: boolean }>(
    await fetch(`/api/workouts/${id}`, { method: "DELETE" }),
  );
}

export async function postExercise(name: string, muscleGroup: MuscleGroup) {
  const response = await fetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, muscleGroup }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `API error ${response.status}`);
  }

  return parseJson<{ exercise: GymmateStore["exercises"][number] }>(response);
}

export async function removeExercise(id: string) {
  const response = await fetch(`/api/exercises/${id}`, { method: "DELETE" });

  if (response.ok) {
    return "deleted" as const;
  }

  if (response.status === 404) {
    return "not_found" as const;
  }

  if (response.status === 409) {
    return "in_use" as const;
  }

  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  throw new Error(body?.message ?? `API error ${response.status}`);
}

export async function fetchArticles() {
  return parseJson<{ articles: import("@/lib/types").Article[] }>(
    await fetch("/api/articles"),
  );
}
