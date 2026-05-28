"use client";

import { useSyncExternalStore } from "react";
import {
  GYMMATE_UPDATE_EVENT,
  getDefaultStore,
  loadStore,
  type GymmateStore,
} from "@/lib/gymmate-storage";

let clientSnapshot: GymmateStore | null = null;
const serverSnapshot: GymmateStore = getDefaultStore();

function readClientSnapshot(): GymmateStore {
  clientSnapshot = loadStore();
  return clientSnapshot;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => {
    readClientSnapshot();
    onStoreChange();
  };

  if (clientSnapshot === null) {
    readClientSnapshot();
  }

  window.addEventListener(GYMMATE_UPDATE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(GYMMATE_UPDATE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

function getSnapshot(): GymmateStore {
  if (clientSnapshot === null) {
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
