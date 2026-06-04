"use client";

import { useSyncExternalStore } from "react";
import { fetchStore, isApiEnabled } from "@/lib/gymmate-api";
import { emptyBodyMeasurements, normalizeBodyMeasurements } from "@/lib/measurements";
import type { Profile } from "@/lib/types";
import {
  GYMMATE_STORE_INVALIDATE_EVENT,
  GYMMATE_UPDATE_EVENT,
  getStoreRevision,
  loadStore,
  type GymmateStore,
} from "@/lib/gymmate-storage";

const EMPTY_API_STORE: GymmateStore = {
  workouts: [],
  profile: {
    name: "",
    lastName: "",
    email: "",
    phone: "",
    goal: "MUSCLE_GAIN",
    startWeight: 0,
    currentWeight: 0,
    startMeasurements: emptyBodyMeasurements(),
    currentMeasurements: emptyBodyMeasurements(),
  },
  bodyMetrics: [],
  measurementMetrics: [],
  exercises: [],
};

let clientSnapshot: GymmateStore | null = null;
let cachedRevision = -1;
let apiFetchVersion = 0;
let apiFetchPromise: Promise<void> | null = null;
let apiLoadError: string | null = null;

function readLocalSnapshot(): GymmateStore {
  clientSnapshot = loadStore();
  cachedRevision = getStoreRevision();
  return clientSnapshot;
}

async function readApiSnapshot() {
  const version = ++apiFetchVersion;

  try {
    const store = await fetchStore();
    if (version === apiFetchVersion) {
      clientSnapshot = store;
      apiLoadError = null;
    }
  } catch (error) {
    console.error("Failed to load store from API:", error);
    if (version === apiFetchVersion) {
      apiLoadError =
        error instanceof Error ? error.message : "Не удалось загрузить данные";
    }
  }
}

function ensureApiSnapshot(onStoreChange: () => void) {
  if (apiFetchPromise) {
    void apiFetchPromise.then(onStoreChange);
    return;
  }

  apiFetchPromise = readApiSnapshot().finally(() => {
    apiFetchPromise = null;
  });

  void apiFetchPromise.then(onStoreChange);
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    if (isApiEnabled()) {
      void readApiSnapshot().then(() => onStoreChange());
      return;
    }

    readLocalSnapshot();
    onStoreChange();
  };

  const handleInvalidate = () => {
    if (isApiEnabled()) {
      void readApiSnapshot().then(() => onStoreChange());
      return;
    }

    readLocalSnapshot();
    onStoreChange();
  };

  if (isApiEnabled()) {
    ensureApiSnapshot(onStoreChange);
  } else if (clientSnapshot === null) {
    readLocalSnapshot();
  }

  window.addEventListener(GYMMATE_UPDATE_EVENT, handleChange);
  window.addEventListener(GYMMATE_STORE_INVALIDATE_EVENT, handleInvalidate);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(GYMMATE_UPDATE_EVENT, handleChange);
    window.removeEventListener(GYMMATE_STORE_INVALIDATE_EVENT, handleInvalidate);
    window.removeEventListener("storage", handleChange);
  };
}

function getSnapshot(): GymmateStore {
  if (clientSnapshot !== null) {
    return clientSnapshot;
  }

  if (isApiEnabled()) {
    return EMPTY_API_STORE;
  }

  return readLocalSnapshot();
}

function getServerSnapshot(): GymmateStore {
  return EMPTY_API_STORE;
}

export function resetGymmateStoreCache() {
  clientSnapshot = null;
  cachedRevision = -1;
  apiFetchVersion += 1;
  apiFetchPromise = null;
  apiLoadError = null;
}

export function useGymmateStore(): GymmateStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useGymmateStoreLoading(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isApiEnabled() && clientSnapshot === null && apiLoadError === null,
    () => isApiEnabled(),
  );
}

export function useGymmateStoreError(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (isApiEnabled() ? apiLoadError : null),
    () => null,
  );
}

export function retryGymmateStoreLoad() {
  if (typeof window === "undefined" || !isApiEnabled()) {
    return;
  }

  apiLoadError = null;
  clientSnapshot = null;
  apiFetchVersion += 1;
  apiFetchPromise = null;
  window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
}

export function refreshGymmateStore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
}

export function reloadGymmateStore(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (!isApiEnabled()) {
    readLocalSnapshot();
    window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
    return Promise.resolve();
  }

  return readApiSnapshot().then(() => {
    window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
  });
}

export function applyGymmateProfile(profile: Profile) {
  const nextProfile = {
    ...profile,
    startMeasurements: normalizeBodyMeasurements(profile.startMeasurements),
    currentMeasurements: normalizeBodyMeasurements(profile.currentMeasurements),
  };

  clientSnapshot = clientSnapshot
    ? { ...clientSnapshot, profile: nextProfile }
    : isApiEnabled()
      ? { ...EMPTY_API_STORE, profile: nextProfile }
      : { ...readLocalSnapshot(), profile: nextProfile };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
  }
}
