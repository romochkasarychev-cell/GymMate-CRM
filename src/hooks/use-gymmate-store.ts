"use client";

import { useSyncExternalStore } from "react";
import { fetchStore, isApiEnabled } from "@/lib/gymmate-api";
import {
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
  },
  bodyMetrics: [],
  exercises: [],
};

let clientSnapshot: GymmateStore | null = null;
let cachedRevision = -1;
let apiFetchVersion = 0;
let apiFetchPromise: Promise<void> | null = null;

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
    }
  } catch (error) {
    console.error("Failed to load store from API:", error);
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

  if (isApiEnabled()) {
    ensureApiSnapshot(onStoreChange);
  } else if (clientSnapshot === null) {
    readLocalSnapshot();
  }

  window.addEventListener(GYMMATE_UPDATE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(GYMMATE_UPDATE_EVENT, handleChange);
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
}

export function useGymmateStore(): GymmateStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function refreshGymmateStore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
}
