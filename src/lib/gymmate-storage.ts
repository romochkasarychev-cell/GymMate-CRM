import {
  bodyMetrics as seedBodyMetrics,
  profile as seedProfile,
  workouts as seedWorkouts,
} from "@/lib/mock-data";
import type { BodyMetric, Profile, Workout, WorkoutSet } from "@/lib/types";

const STORAGE_KEYS = {
  initialized: "gymmate:initialized",
  workouts: "gymmate:workouts",
  profile: "gymmate:profile",
  bodyMetrics: "gymmate:bodyMetrics",
} as const;

export const GYMMATE_UPDATE_EVENT = "gymmate-update";

type StoredWorkout = Omit<Workout, "date"> & { date: string };
type StoredBodyMetric = Omit<BodyMetric, "date"> & { date: string };

export type GymmateStore = {
  workouts: Workout[];
  profile: Profile;
  bodyMetrics: BodyMetric[];
};

function isBrowser() {
  return typeof window !== "undefined";
}

function serializeWorkout(workout: Workout): StoredWorkout {
  return {
    ...workout,
    date: workout.date.toISOString(),
  };
}

function parseWorkout(workout: StoredWorkout): Workout {
  return {
    ...workout,
    date: new Date(workout.date),
  };
}

function serializeBodyMetric(metric: BodyMetric): StoredBodyMetric {
  return {
    ...metric,
    date: metric.date.toISOString(),
  };
}

function parseBodyMetric(metric: StoredBodyMetric): BodyMetric {
  return {
    ...metric,
    date: new Date(metric.date),
  };
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function notifyUpdate() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
}

export function getDefaultStore(): GymmateStore {
  return {
    workouts: seedWorkouts.map((workout) => ({
      ...workout,
      date: new Date(workout.date),
    })),
    profile: { ...seedProfile },
    bodyMetrics: seedBodyMetrics.map((metric) => ({
      ...metric,
      date: new Date(metric.date),
    })),
  };
}

function initStoreIfNeeded() {
  if (!isBrowser()) return;

  if (window.localStorage.getItem(STORAGE_KEYS.initialized)) return;

  const defaults = getDefaultStore();

  writeJson(
    STORAGE_KEYS.workouts,
    defaults.workouts.map(serializeWorkout),
  );
  writeJson(STORAGE_KEYS.profile, defaults.profile);
  writeJson(
    STORAGE_KEYS.bodyMetrics,
    defaults.bodyMetrics.map(serializeBodyMetric),
  );
  window.localStorage.setItem(STORAGE_KEYS.initialized, "1");
}

export function loadStore(): GymmateStore {
  if (!isBrowser()) return getDefaultStore();

  initStoreIfNeeded();

  const storedWorkouts = readJson<StoredWorkout[]>(STORAGE_KEYS.workouts);
  const storedProfile = readJson<Profile>(STORAGE_KEYS.profile);
  const storedMetrics = readJson<StoredBodyMetric[]>(STORAGE_KEYS.bodyMetrics);

  if (!storedWorkouts || !storedProfile || !storedMetrics) {
    return getDefaultStore();
  }

  return {
    workouts: storedWorkouts.map(parseWorkout),
    profile: storedProfile,
    bodyMetrics: storedMetrics.map(parseBodyMetric),
  };
}

export function saveWorkouts(workouts: Workout[]) {
  writeJson(
    STORAGE_KEYS.workouts,
    workouts.map(serializeWorkout),
  );
  notifyUpdate();
}

export function saveProfile(profile: Profile) {
  writeJson(STORAGE_KEYS.profile, profile);
  notifyUpdate();
}

export function saveBodyMetrics(bodyMetrics: BodyMetric[]) {
  writeJson(
    STORAGE_KEYS.bodyMetrics,
    bodyMetrics.map(serializeBodyMetric),
  );
  notifyUpdate();
}

export function addWorkout(workout: Workout) {
  const store = loadStore();
  saveWorkouts([workout, ...store.workouts]);
}

export function updateProfile(profile: Profile, previousWeight?: number) {
  const store = loadStore();
  saveProfile(profile);

  if (previousWeight !== undefined && profile.currentWeight !== previousWeight) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const sameDayIndex = store.bodyMetrics.findIndex((metric) => {
      const metricDate = new Date(metric.date);
      return metricDate.toDateString() === today.toDateString();
    });

    const nextMetrics = [...store.bodyMetrics];

    if (sameDayIndex >= 0) {
      nextMetrics[sameDayIndex] = { date: today, weight: profile.currentWeight };
    } else {
      nextMetrics.push({ date: today, weight: profile.currentWeight });
    }

    nextMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());
    saveBodyMetrics(nextMetrics);
  }
}

export function buildWorkoutSets(
  sets: { exerciseId: string; weight: string; reps: string }[],
  exercises: { id: string; name: string }[],
): WorkoutSet[] {
  const counters = new Map<string, number>();

  return sets.map((set) => {
    const exercise = exercises.find((item) => item.id === set.exerciseId);
    const setNumber = (counters.get(set.exerciseId) ?? 0) + 1;
    counters.set(set.exerciseId, setNumber);

    return {
      id: crypto.randomUUID(),
      exerciseId: set.exerciseId,
      exerciseName: exercise?.name ?? "Упражнение",
      setNumber,
      weight: Number.parseFloat(set.weight) || 0,
      reps: Number.parseInt(set.reps, 10) || 0,
    };
  });
}

export function createWorkout(
  notes: string,
  sets: { exerciseId: string; weight: string; reps: string }[],
  exercises: { id: string; name: string }[],
): Workout {
  return {
    id: crypto.randomUUID(),
    date: new Date(),
    notes: notes.trim() || undefined,
    sets: buildWorkoutSets(sets, exercises),
  };
}
