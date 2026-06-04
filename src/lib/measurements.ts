import type { BodyMeasurements, Profile } from "@/lib/types";

export type MeasurementFieldKey = keyof BodyMeasurements;

export const MEASUREMENT_FIELD_KEYS: MeasurementFieldKey[] = [
  "shoulders",
  "chest",
  "waist",
  "hips",
  "armRight",
  "armLeft",
  "legRight",
  "legLeft",
];

export const emptyBodyMeasurements = (): BodyMeasurements => ({
  shoulders: 0,
  chest: 0,
  waist: 0,
  hips: 0,
  armRight: 0,
  armLeft: 0,
  legRight: 0,
  legLeft: 0,
});

export function hasAnyMeasurement(measurements: BodyMeasurements) {
  return MEASUREMENT_FIELD_KEYS.some((key) => measurements[key] > 0);
}

export function normalizeBodyMeasurements(
  measurements?: Partial<BodyMeasurements> | null,
): BodyMeasurements {
  const defaults = emptyBodyMeasurements();

  if (!measurements) {
    return defaults;
  }

  return {
    shoulders: measurements.shoulders ?? defaults.shoulders,
    chest: measurements.chest ?? defaults.chest,
    waist: measurements.waist ?? defaults.waist,
    hips: measurements.hips ?? defaults.hips,
    armRight: measurements.armRight ?? defaults.armRight,
    armLeft: measurements.armLeft ?? defaults.armLeft,
    legRight: measurements.legRight ?? defaults.legRight,
    legLeft: measurements.legLeft ?? defaults.legLeft,
  };
}

export const normalizeStartMeasurements = normalizeBodyMeasurements;
export const normalizeCurrentMeasurements = normalizeBodyMeasurements;

export function formatMeasurementCm(value: number) {
  return value > 0 ? `${value} см` : "—";
}

export function formatMeasurementDelta(value: number) {
  const label = value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  return `${label} см`;
}

export function parseMeasurementCm(raw: string) {
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

type UserStartMeasurementRecord = {
  startShoulders: number;
  startChest: number;
  startWaist: number;
  startHips: number;
  startArmRight: number;
  startArmLeft: number;
  startLegRight: number;
  startLegLeft: number;
};

type UserCurrentMeasurementRecord = {
  currentShoulders: number;
  currentChest: number;
  currentWaist: number;
  currentHips: number;
  currentArmRight: number;
  currentArmLeft: number;
  currentLegRight: number;
  currentLegLeft: number;
};

export function mapUserStartMeasurements(
  user: UserStartMeasurementRecord,
): BodyMeasurements {
  return {
    shoulders: user.startShoulders,
    chest: user.startChest,
    waist: user.startWaist,
    hips: user.startHips,
    armRight: user.startArmRight,
    armLeft: user.startArmLeft,
    legRight: user.startLegRight,
    legLeft: user.startLegLeft,
  };
}

export function mapUserCurrentMeasurements(
  user: UserCurrentMeasurementRecord,
): BodyMeasurements {
  return {
    shoulders: user.currentShoulders,
    chest: user.currentChest,
    waist: user.currentWaist,
    hips: user.currentHips,
    armRight: user.currentArmRight,
    armLeft: user.currentArmLeft,
    legRight: user.currentLegRight,
    legLeft: user.currentLegLeft,
  };
}

export function startMeasurementsToUserData(measurements: BodyMeasurements) {
  return {
    startShoulders: measurements.shoulders,
    startChest: measurements.chest,
    startWaist: measurements.waist,
    startHips: measurements.hips,
    startArmRight: measurements.armRight,
    startArmLeft: measurements.armLeft,
    startLegRight: measurements.legRight,
    startLegLeft: measurements.legLeft,
  };
}

export function currentMeasurementsToUserData(measurements: BodyMeasurements) {
  return {
    currentShoulders: measurements.shoulders,
    currentChest: measurements.chest,
    currentWaist: measurements.waist,
    currentHips: measurements.hips,
    currentArmRight: measurements.armRight,
    currentArmLeft: measurements.armLeft,
    currentLegRight: measurements.legRight,
    currentLegLeft: measurements.legLeft,
  };
}

export const measurementFieldLabels: Record<MeasurementFieldKey, string> = {
  shoulders: "Объём плеч",
  chest: "Объём груди",
  waist: "Объём талии",
  hips: "Объём бёдер",
  armRight: "Правая рука",
  armLeft: "Левая рука",
  legRight: "Правая нога",
  legLeft: "Левая нога",
};

export const measurementSingles: {
  key: MeasurementFieldKey;
  label: string;
}[] = [
  { key: "shoulders", label: measurementFieldLabels.shoulders },
  { key: "chest", label: measurementFieldLabels.chest },
  { key: "waist", label: measurementFieldLabels.waist },
  { key: "hips", label: measurementFieldLabels.hips },
];

export const measurementPairs: {
  title: string;
  right: { key: MeasurementFieldKey; label: string };
  left: { key: MeasurementFieldKey; label: string };
}[] = [
  {
    title: "Объём рук",
    right: { key: "armRight", label: "Правая" },
    left: { key: "armLeft", label: "Левая" },
  },
  {
    title: "Объём ног",
    right: { key: "legRight", label: "Правая" },
    left: { key: "legLeft", label: "Левая" },
  },
];

export function patchStartMeasurement(
  profile: Profile,
  key: MeasurementFieldKey,
  value: number,
): Profile {
  return {
    ...profile,
    startMeasurements: {
      ...profile.startMeasurements,
      [key]: value,
    },
  };
}

export function patchCurrentMeasurement(
  profile: Profile,
  key: MeasurementFieldKey,
  value: number,
): Profile {
  return {
    ...profile,
    currentMeasurements: {
      ...profile.currentMeasurements,
      [key]: value,
    },
  };
}

export const PRISMA_MEASUREMENT_KIND = {
  shoulders: "SHOULDERS",
  chest: "CHEST",
  waist: "WAIST",
  hips: "HIPS",
  armRight: "ARM_RIGHT",
  armLeft: "ARM_LEFT",
  legRight: "LEG_RIGHT",
  legLeft: "LEG_LEFT",
} as const;

export const MEASUREMENT_KIND_TO_FIELD = {
  SHOULDERS: "shoulders",
  CHEST: "chest",
  WAIST: "waist",
  HIPS: "hips",
  ARM_RIGHT: "armRight",
  ARM_LEFT: "armLeft",
  LEG_RIGHT: "legRight",
  LEG_LEFT: "legLeft",
} as const satisfies Record<
  (typeof PRISMA_MEASUREMENT_KIND)[MeasurementFieldKey],
  MeasurementFieldKey
>;

// Backward-compatible aliases
export const startMeasurementSingles = measurementSingles;
export const startMeasurementPairs = measurementPairs;
export const emptyStartMeasurements = emptyBodyMeasurements;
