import {
  consolidateMetricsByDay,
  recordCurrentMetric,
  buildBaselineBodyMetrics,
  upsertStartMetric,
} from "@/lib/body-metrics";
import {
  normalizeBodyMeasurements,
} from "@/lib/measurements";
import {
  applyMeasurementMetricUpdates,
  buildAllBaselineMeasurementMetrics,
  consolidateMeasurementMetrics,
  type MeasurementMetricUpdateOptions,
} from "@/lib/measurement-metrics";
import { resolveProfileMeasurements } from "@/lib/profile-mapper";
import {
  fetchStore,
  isApiEnabled,
  patchProfile as apiPatchProfile,
  patchWorkout as apiPatchWorkout,
  postExercise as apiPostExercise,
  postWorkout as apiPostWorkout,
  removeWorkout as apiRemoveWorkout,
} from "@/lib/gymmate-api";
import {
  exercises as seedExercises,
  profile as seedProfile,
  workouts as seedWorkouts,
} from "@/lib/mock-data";
import type {
  BodyMetric,
  Exercise,
  MeasurementMetric,
  MuscleGroup,
  Profile,
  Workout,
  WorkoutLabel,
  WorkoutSet,
} from "@/lib/types";
import { buildWorkoutSets as buildWorkoutSetsFromUtils, createWorkoutFromInput } from "@/lib/workout-utils";

const STORAGE_KEYS = {
  initialized: "gymmate:initialized",
  revision: "gymmate:revision",
  workouts: "gymmate:workouts",
  profile: "gymmate:profile",
  bodyMetrics: "gymmate:bodyMetrics",
  measurementMetrics: "gymmate:measurementMetrics",
  exercises: "gymmate:exercises",
} as const;

export const GYMMATE_UPDATE_EVENT = "gymmate-update";
export const GYMMATE_STORE_INVALIDATE_EVENT = "gymmate-store-invalidate";

type StoredWorkout = Omit<Workout, "date"> & { date: string };
type StoredBodyMetric = Omit<BodyMetric, "date"> & { date: string };
type StoredMeasurementMetric = Omit<MeasurementMetric, "date"> & { date: string };

export type GymmateStore = {
  workouts: Workout[];
  profile: Profile;
  bodyMetrics: BodyMetric[];
  measurementMetrics: MeasurementMetric[];
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

function serializeMeasurementMetric(metric: MeasurementMetric): StoredMeasurementMetric {
  return {
    ...metric,
    date: metric.date.toISOString(),
  };
}

function parseMeasurementMetric(metric: StoredMeasurementMetric): MeasurementMetric {
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

function parseProfile(
  profile: Profile,
  measurementMetrics: MeasurementMetric[] = [],
): Profile {
  const normalized = {
    ...profile,
    lastName: profile.lastName ?? seedProfile.lastName,
    phone: profile.phone ?? seedProfile.phone,
    startWeight: profile.startWeight ?? profile.currentWeight,
    startMeasurements: normalizeBodyMeasurements(
      profile.startMeasurements ?? seedProfile.startMeasurements,
    ),
    currentMeasurements: normalizeBodyMeasurements(
      profile.currentMeasurements ?? seedProfile.currentMeasurements,
    ),
  };

  return resolveProfileMeasurements(normalized, measurementMetrics);
}

export function getDefaultStore(): GymmateStore {
  const profile = parseProfile({ ...seedProfile });

  return {
    workouts: seedWorkouts.map((workout) => ({
      ...workout,
      date: new Date(workout.date),
    })),
    profile,
    bodyMetrics: buildBaselineBodyMetrics(
      profile,
      new Date("2025-11-12T12:00:00"),
      new Date("2026-05-26T12:00:00"),
    ),
    measurementMetrics: buildAllBaselineMeasurementMetrics(
      profile,
      new Date("2025-11-12T12:00:00"),
      new Date("2026-05-26T12:00:00"),
    ),
    exercises: [...seedExercises],
  };
}

export function resetBodyMetricsFromProfile(profile: Profile, startDate = new Date()) {
  const baseline = buildBaselineBodyMetrics(profile, startDate);
  saveBodyMetrics(baseline);
  return baseline;
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
  writeJson(
    STORAGE_KEYS.measurementMetrics,
    defaults.measurementMetrics.map(serializeMeasurementMetric),
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
  const storedMeasurementMetrics = readJson<StoredMeasurementMetric[]>(
    STORAGE_KEYS.measurementMetrics,
  );
  const storedExercises = readJson<Exercise[]>(STORAGE_KEYS.exercises);
  const defaults = getDefaultStore();

  if (!storedExercises && window.localStorage.getItem(STORAGE_KEYS.initialized)) {
    writeJson(STORAGE_KEYS.exercises, defaults.exercises);
  }

  if (!storedWorkouts && !storedProfile && !storedMetrics && !storedExercises) {
    return defaults;
  }

  const parsedMetrics =
    storedMeasurementMetrics?.map(parseMeasurementMetric) ??
    defaults.measurementMetrics;

  return {
    workouts: storedWorkouts?.map(parseWorkout) ?? defaults.workouts,
    profile: storedProfile
      ? parseProfile(storedProfile, parsedMetrics)
      : defaults.profile,
    bodyMetrics: consolidateMetricsByDay(
      storedMetrics?.map(parseBodyMetric) ?? defaults.bodyMetrics,
    ),
    measurementMetrics: consolidateMeasurementMetrics(parsedMetrics),
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

export function saveMeasurementMetrics(measurementMetrics: MeasurementMetric[]) {
  writeJson(
    STORAGE_KEYS.measurementMetrics,
    measurementMetrics.map(serializeMeasurementMetric),
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

export function addWorkout(workout: Workout): Workout | Promise<Workout> {
  if (isApiEnabled()) {
    return (async () => {
      const store = await fetchStore();
      const created = await apiPostWorkout(workout, store.exercises);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(GYMMATE_STORE_INVALIDATE_EVENT));
      }
      notifyUpdate();
      return created;
    })();
  }

  const store = loadStore();
  saveWorkouts([workout, ...store.workouts]);
  return workout;
}

export function updateWorkout(workout: Workout): boolean | Promise<boolean> {
  if (isApiEnabled()) {
    return (async () => {
      const store = await fetchStore();
      await apiPatchWorkout(workout, store.exercises);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(GYMMATE_STORE_INVALIDATE_EVENT));
      }
      notifyUpdate();
      return true;
    })();
  }

  const store = loadStore();
  const nextWorkouts = store.workouts.map((item) =>
    item.id === workout.id ? workout : item,
  );

  if (!store.workouts.some((item) => item.id === workout.id)) {
    return false;
  }

  saveWorkouts(nextWorkouts);
  return true;
}

export function deleteWorkout(id: string) {
  if (isApiEnabled()) {
    void (async () => {
      await apiRemoveWorkout(id);
      notifyUpdate();
    })();
    return true;
  }

  const store = loadStore();
  const nextWorkouts = store.workouts.filter((item) => item.id !== id);

  if (nextWorkouts.length === store.workouts.length) {
    return false;
  }

  saveWorkouts(nextWorkouts);
  return true;
}

export type DeleteExerciseResult = "deleted" | "not_found" | "in_use";

export function deleteExercise(id: string): DeleteExerciseResult {
  const store = loadStore();
  const exists = store.exercises.some((item) => item.id === id);

  if (!exists) {
    return "not_found";
  }

  const inUse = store.workouts.some((workout) =>
    workout.sets.some((set) => set.exerciseId === id),
  );

  if (inUse) {
    return "in_use";
  }

  saveExercises(store.exercises.filter((item) => item.id !== id));
  return "deleted";
}

export type ProfileUpdateOptions = {
  previousWeight?: number;
  previousStartWeight?: number;
} & MeasurementMetricUpdateOptions;

function syncEarliestLocalBodyMetric(
  metrics: BodyMetric[],
  weight: number,
  startDate: Date,
) {
  return upsertStartMetric(metrics, weight, startDate);
}

export async function updateProfile(
  profile: Profile,
  options: ProfileUpdateOptions = {},
): Promise<Profile | void> {
  const { previousWeight, previousStartWeight, ...measurementOptions } = options;

  if (isApiEnabled()) {
    const updated = await apiPatchProfile(profile, {
      previousWeight,
      previousStartWeight,
      ...measurementOptions,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(GYMMATE_STORE_INVALIDATE_EVENT));
    }
    notifyUpdate();
    return updated;
  }

  const store = loadStore();
  const previousProfile = store.profile;
  saveProfile(profile);

  let nextMetrics =
    store.bodyMetrics.length > 0
      ? [...store.bodyMetrics]
      : buildBaselineBodyMetrics(profile, new Date("2025-11-12T12:00:00"));

  let nextMeasurementMetrics =
    store.measurementMetrics.length > 0
      ? [...store.measurementMetrics]
      : buildAllBaselineMeasurementMetrics(profile, new Date("2025-11-12T12:00:00"));

  let metricsChanged = store.bodyMetrics.length === 0;
  let measurementMetricsChanged = store.measurementMetrics.length === 0;

  if (
    previousStartWeight !== undefined &&
    profile.startWeight !== previousStartWeight
  ) {
    nextMetrics = syncEarliestLocalBodyMetric(
      nextMetrics,
      profile.startWeight,
      new Date("2025-11-12T12:00:00"),
    );
    metricsChanged = true;
  }

  if (previousWeight !== undefined && profile.currentWeight !== previousWeight) {
    nextMetrics = recordCurrentMetric(nextMetrics, profile.currentWeight);
    metricsChanged = true;
  }

  const measurementSync = applyMeasurementMetricUpdates(
    nextMeasurementMetrics,
    profile,
    previousProfile.startMeasurements,
    new Date("2025-11-12T12:00:00"),
    measurementOptions,
  );

  if (measurementSync.changed) {
    nextMeasurementMetrics = measurementSync.metrics;
    measurementMetricsChanged = true;
  }

  if (metricsChanged) {
    nextMetrics.sort((a, b) => a.date.getTime() - b.date.getTime());
    saveBodyMetrics(nextMetrics);
  }

  if (measurementMetricsChanged) {
    saveMeasurementMetrics(nextMeasurementMetrics);
  }
}

export function buildWorkoutSets(
  sets: { exerciseId: string; weight: string; reps: string }[],
  exercises: { id: string; name: string }[],
): WorkoutSet[] {
  return buildWorkoutSetsFromUtils(sets, exercises);
}

export function createWorkout(
  label: WorkoutLabel,
  notes: string,
  sets: { exerciseId: string; weight: string; reps: string }[],
  exercises: { id: string; name: string }[],
  existing?: Pick<Workout, "id" | "date">,
): Workout {
  return createWorkoutFromInput(label, notes, sets, exercises, existing);
}
