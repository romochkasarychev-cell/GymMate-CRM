import {
  bodyMetrics as seedBodyMetrics,
  exercises as seedExercises,
  profile as seedProfile,
  workouts as seedWorkouts,
} from "@/lib/mock-data";
import type {
  BodyMetric,
  Exercise,
  MuscleGroup,
  Profile,
  Workout,
  WorkoutLabel,
  WorkoutSet,
} from "@/lib/types";

const STORAGE_KEYS = {
  initialized: "gymmate:initialized",
  revision: "gymmate:revision",
  workouts: "gymmate:workouts",
  profile: "gymmate:profile",
  bodyMetrics: "gymmate:bodyMetrics",
  exercises: "gymmate:exercises",
} as const;

export const GYMMATE_UPDATE_EVENT = "gymmate-update";

type StoredWorkout = Omit<Workout, "date"> & { date: string };
type StoredBodyMetric = Omit<BodyMetric, "date"> & { date: string };

export type GymmateStore = {
  workouts: Workout[];
  profile: Profile;
  bodyMetrics: BodyMetric[];
  exercises: Exercise[];
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
    label: workout.label ?? "MEDIUM",
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

export function getStoreRevision(): number {
  if (!isBrowser()) return 0;
  return Number(window.localStorage.getItem(STORAGE_KEYS.revision) ?? "0");
}

function bumpStoreRevision() {
  if (!isBrowser()) return;
  const nextRevision = getStoreRevision() + 1;
  window.localStorage.setItem(STORAGE_KEYS.revision, String(nextRevision));
  notifyUpdate();
}

function parseProfile(profile: Profile): Profile {
  return {
    ...profile,
    lastName: profile.lastName ?? seedProfile.lastName,
    phone: profile.phone ?? seedProfile.phone,
    startWeight: profile.startWeight ?? profile.currentWeight,
  };
}

export function getDefaultStore(): GymmateStore {
  return {
    workouts: seedWorkouts.map((workout) => ({
      ...workout,
      date: new Date(workout.date),
    })),
    profile: parseProfile({ ...seedProfile }),
    bodyMetrics: seedBodyMetrics.map((metric) => ({
      ...metric,
      date: new Date(metric.date),
    })),
    exercises: [...seedExercises],
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
  writeJson(STORAGE_KEYS.exercises, defaults.exercises);
  window.localStorage.setItem(STORAGE_KEYS.initialized, "1");
  window.localStorage.setItem(STORAGE_KEYS.revision, "0");
}

export function loadStore(): GymmateStore {
  if (!isBrowser()) return getDefaultStore();

  initStoreIfNeeded();

  const storedWorkouts = readJson<StoredWorkout[]>(STORAGE_KEYS.workouts);
  const storedProfile = readJson<Profile>(STORAGE_KEYS.profile);
  const storedMetrics = readJson<StoredBodyMetric[]>(STORAGE_KEYS.bodyMetrics);
  const storedExercises = readJson<Exercise[]>(STORAGE_KEYS.exercises);
  const defaults = getDefaultStore();

  if (!storedExercises && window.localStorage.getItem(STORAGE_KEYS.initialized)) {
    writeJson(STORAGE_KEYS.exercises, defaults.exercises);
  }

  if (!storedWorkouts && !storedProfile && !storedMetrics && !storedExercises) {
    return defaults;
  }

  return {
    workouts: storedWorkouts?.map(parseWorkout) ?? defaults.workouts,
    profile: storedProfile ? parseProfile(storedProfile) : defaults.profile,
    bodyMetrics: storedMetrics?.map(parseBodyMetric) ?? defaults.bodyMetrics,
    exercises: storedExercises ?? defaults.exercises,
  };
}

export function saveWorkouts(workouts: Workout[]) {
  writeJson(
    STORAGE_KEYS.workouts,
    workouts.map(serializeWorkout),
  );
  bumpStoreRevision();
}

export function saveProfile(profile: Profile) {
  writeJson(STORAGE_KEYS.profile, profile);
  bumpStoreRevision();
}

export function saveBodyMetrics(bodyMetrics: BodyMetric[]) {
  writeJson(
    STORAGE_KEYS.bodyMetrics,
    bodyMetrics.map(serializeBodyMetric),
  );
  bumpStoreRevision();
}

export function saveExercises(exercises: Exercise[]) {
  writeJson(STORAGE_KEYS.exercises, exercises);
  bumpStoreRevision();
}

export function addExercise(name: string, muscleGroup: MuscleGroup) {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  const store = loadStore();
  const exists = store.exercises.some(
    (exercise) =>
      exercise.muscleGroup === muscleGroup &&
      exercise.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (exists) return false;

  const nextExercise: Exercise = {
    id: crypto.randomUUID(),
    name: trimmedName,
    muscleGroup,
  };

  saveExercises([...store.exercises, nextExercise]);
  return true;
}

export function addWorkout(workout: Workout) {
  const store = loadStore();
  saveWorkouts([workout, ...store.workouts]);
}

export function updateWorkout(workout: Workout) {
  const store = loadStore();
  const nextWorkouts = store.workouts.map((item) =>
    item.id === workout.id ? workout : item,
  );

  if (!store.workouts.some((item) => item.id === workout.id)) {
    return;
  }

  saveWorkouts(nextWorkouts);
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
  label: WorkoutLabel,
  notes: string,
  sets: { exerciseId: string; weight: string; reps: string }[],
  exercises: { id: string; name: string }[],
  existing?: Pick<Workout, "id" | "date">,
): Workout {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    date: existing?.date ?? new Date(),
    label,
    notes: notes.trim() || undefined,
    sets: buildWorkoutSets(sets, exercises),
  };
}
