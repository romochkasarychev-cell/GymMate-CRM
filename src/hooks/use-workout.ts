"use client";

import { useEffect, useState } from "react";
import { fetchWorkout, isApiEnabled } from "@/lib/gymmate-api";
import { useGymmateStore, useGymmateStoreLoading } from "@/hooks/use-gymmate-store";
import type { Workout } from "@/lib/types";

type UseWorkoutOptions = {
  initialWorkout?: Workout;
};

export function useWorkout(id: string, options: UseWorkoutOptions = {}) {
  const { initialWorkout } = options;
  const storeLoading = useGymmateStoreLoading();
  const { workouts } = useGymmateStore();
  const storeWorkout = workouts.find((item) => item.id === id);
  const [remoteWorkout, setRemoteWorkout] = useState<Workout | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteChecked, setRemoteChecked] = useState(Boolean(initialWorkout));

  useEffect(() => {
    setRemoteWorkout(null);
    setRemoteLoading(false);
    setRemoteChecked(Boolean(initialWorkout));
  }, [id, initialWorkout]);

  useEffect(() => {
    if (initialWorkout) {
      return;
    }

    if (storeWorkout) {
      setRemoteWorkout(null);
      setRemoteLoading(false);
      setRemoteChecked(true);
      return;
    }

    if (storeLoading || !isApiEnabled()) {
      return;
    }

    let cancelled = false;
    setRemoteLoading(true);
    setRemoteChecked(false);

    void fetchWorkout(id)
      .then((workout) => {
        if (!cancelled) {
          setRemoteWorkout(workout);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRemoteWorkout(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRemoteLoading(false);
          setRemoteChecked(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, initialWorkout, storeLoading, storeWorkout]);

  const workout = initialWorkout ?? storeWorkout ?? remoteWorkout;

  const loading =
    !initialWorkout &&
    (storeLoading ||
      remoteLoading ||
      (isApiEnabled() && !storeWorkout && !remoteChecked));

  return {
    workout,
    loading,
    missing: !loading && !workout,
  };
}
