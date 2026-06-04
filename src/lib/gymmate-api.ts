import { normalizeBodyMeasurements, type MeasurementFieldKey } from "@/lib/measurements";
import type { MeasurementMetricUpdateOptions } from "@/lib/measurement-metrics";
import type { GymmateStore } from "@/lib/gymmate-storage";
import type { MuscleGroup, Profile, Workout } from "@/lib/types";

export function isApiEnabled() {
  return process.env.NEXT_PUBLIC_USE_API === "true";
}

const apiFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, { ...init, credentials: "include" });

function redirectIfUnauthorized(response: Response) {
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
}

type ApiStoreResponse = {
  profile: Profile;
  workouts: Array<Omit<Workout, "date"> & { date: string }>;
  bodyMetrics: Array<{ date: string; weight: number }>;
  measurementMetrics: Array<{ date: string; kind: MeasurementFieldKey; value: number }>;
  exercises: GymmateStore["exercises"];
};

async function parseJson<T>(response: Response): Promise<T> {
  redirectIfUnauthorized(response);

  if (!response.ok) {
    redirectIfUnauthorized(response);
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function parseProfile(profile: Profile & { registeredAt?: string | Date }): Profile {
  return {
    ...profile,
    registeredAt: profile.registeredAt
      ? new Date(profile.registeredAt)
      : new Date("2025-11-12T10:00:00"),
    startMeasurements: normalizeBodyMeasurements(profile.startMeasurements),
    currentMeasurements: normalizeBodyMeasurements(profile.currentMeasurements),
  };
}

function parseStore(data: ApiStoreResponse): GymmateStore {
  return {
    profile: parseProfile(data.profile),
    workouts: data.workouts.map((workout) => ({
      ...workout,
      date: new Date(workout.date),
    })),
    bodyMetrics: data.bodyMetrics.map((metric) => ({
      date: new Date(metric.date),
      weight: metric.weight,
    })),
    measurementMetrics: data.measurementMetrics.map((metric) => ({
      date: new Date(metric.date),
      kind: metric.kind,
      value: metric.value,
    })),
    exercises: data.exercises,
  };
}

function parseWorkout(
  workout: ApiStoreResponse["workouts"][number],
): Workout {
  return {
    ...workout,
    date: new Date(workout.date),
  };
}

export async function fetchStore(): Promise<GymmateStore> {
  const data = await parseJson<ApiStoreResponse>(await apiFetch("/api/store"));
  return parseStore(data);
}

export async function patchProfile(
  profile: Profile,
  options: {
    previousWeight?: number;
    previousStartWeight?: number;
  } & MeasurementMetricUpdateOptions = {},
) {
  const data = await parseJson<{ profile: Profile }>(
    await apiFetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, ...options }),
    }),
  );

  return data.profile;
}

export async function postWorkout(
  workout: Workout,
  exercises: { id: string; name: string }[],
) {
  const data = await parseJson<{ workout: ApiStoreResponse["workouts"][number] }>(
    await apiFetch("/api/workouts", {
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

export async function fetchWorkout(id: string) {
  const data = await parseJson<{ workout: ApiStoreResponse["workouts"][number] }>(
    await apiFetch(`/api/workouts/${id}`),
  );

  return parseWorkout(data.workout);
}

export async function patchWorkout(
  workout: Workout,
  exercises: { id: string; name: string }[],
) {
  const data = await parseJson<{ workout: ApiStoreResponse["workouts"][number] }>(
    await apiFetch(`/api/workouts/${workout.id}`, {
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
    await apiFetch(`/api/workouts/${id}`, { method: "DELETE" }),
  );
}

export async function postExercise(name: string, muscleGroup: MuscleGroup) {
  const response = await apiFetch("/api/exercises", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, muscleGroup }),
  });

  if (!response.ok) {
    redirectIfUnauthorized(response);
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? `API error ${response.status}`);
  }

  return parseJson<{ exercise: GymmateStore["exercises"][number] }>(response);
}

export async function removeExercise(id: string) {
  const response = await apiFetch(`/api/exercises/${id}`, { method: "DELETE" });

  redirectIfUnauthorized(response);

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
    await apiFetch("/api/articles"),
  );
}

export async function postArticle(input: {
  title: string;
  description: string;
  category: import("@/lib/types").ArticleCategory;
}) {
  const data = await parseJson<{ article: import("@/lib/types").Article }>(
    await apiFetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

  return data.article;
}

export async function patchArticle(
  id: string,
  input: {
    title: string;
    description: string;
    category: import("@/lib/types").ArticleCategory;
  },
) {
  const data = await parseJson<{ article: import("@/lib/types").Article }>(
    await apiFetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );

  return data.article;
}

export async function removeArticle(id: string) {
  await parseJson<{ ok: boolean }>(
    await apiFetch(`/api/articles/${id}`, { method: "DELETE" }),
  );
}
