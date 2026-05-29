"use client";

import { useSyncExternalStore } from "react";
import {
  GYMMATE_UPDATE_EVENT,
  getDefaultStore,
  getStoreRevision,
  loadStore,
  type GymmateStore,
} from "@/lib/gymmate-storage";

let clientSnapshot: GymmateStore | null = null;
let cachedRevision = -1;
const serverSnapshot: GymmateStore = getDefaultStore();

function readClientSnapshot(): GymmateStore {
  clientSnapshot = loadStore();
  cachedRevision = getStoreRevision();
  return clientSnapshot;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    onStoreChange();
  };

  window.addEventListener(GYMMATE_UPDATE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(GYMMATE_UPDATE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function getSnapshot(): GymmateStore {
  const revision = getStoreRevision();

  if (clientSnapshot === null || cachedRevision !== revision) {
    return readClientSnapshot();
  }

  return clientSnapshot;
}

function getServerSnapshot(): GymmateStore {
  return serverSnapshot;
}

export function useGymmateStore(): GymmateStore {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
