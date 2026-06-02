"use client";

import { useSyncExternalStore } from "react";
import { fetchStore, isApiEnabled } from "@/lib/gymmate-api";
import {
  GYMMATE_UPDATE_EVENT,
  getDefaultStore,
  getStoreRevision,
  loadStore,
  type GymmateStore,
} from "@/lib/gymmate-storage";

let clientSnapshot: GymmateStore | null = null;
let cachedRevision = -1;
let apiFetchVersion = 0;
const serverSnapshot: GymmateStore = getDefaultStore();

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
    if (clientSnapshot === null) {
      void readApiSnapshot().then(() => onStoreChange());
    }
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
  if (isApiEnabled()) {
    return clientSnapshot ?? getDefaultStore();
  }

  const revision = getStoreRevision();

  if (clientSnapshot === null || cachedRevision !== revision) {
    return readLocalSnapshot();
  }

  return clientSnapshot;
}

function getServerSnapshot(): GymmateStore {
  return serverSnapshot;
}

export function useGymmateStore(): GymmateStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function refreshGymmateStore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GYMMATE_UPDATE_EVENT));
}
