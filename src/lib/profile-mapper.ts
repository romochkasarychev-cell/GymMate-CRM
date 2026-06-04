import {
  currentMeasurementsToUserData,
  hasAnyMeasurement,
  mapUserCurrentMeasurements,
  mapUserStartMeasurements,
  normalizeBodyMeasurements,
  startMeasurementsToUserData,
} from "@/lib/measurements";
import { deriveCurrentMeasurementsFromMetrics } from "@/lib/measurement-metrics";
import type { BodyMeasurements, MeasurementMetric, Profile } from "@/lib/types";

type UserProfileRecord = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  goal: Profile["goal"];
  startWeight: number;
  currentWeight: number;
  startShoulders: number;
  startChest: number;
  startWaist: number;
  startHips: number;
  startArmRight: number;
  startArmLeft: number;
  startLegRight: number;
  startLegLeft: number;
  currentShoulders: number;
  currentChest: number;
  currentWaist: number;
  currentHips: number;
  currentArmRight: number;
  currentArmLeft: number;
  currentLegRight: number;
  currentLegLeft: number;
};

export function mapUserToProfile(user: UserProfileRecord): Profile {
  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    goal: user.goal,
    startWeight: user.startWeight,
    currentWeight: user.currentWeight,
    startMeasurements: mapUserStartMeasurements(user),
    currentMeasurements: mapUserCurrentMeasurements(user),
  };
}

export function resolveCurrentMeasurements(
  startMeasurements: BodyMeasurements,
  storedCurrent: BodyMeasurements,
  metrics: MeasurementMetric[] = [],
): BodyMeasurements {
  const current = normalizeBodyMeasurements(storedCurrent);

  if (hasAnyMeasurement(current)) {
    return current;
  }

  const fromMetrics = deriveCurrentMeasurementsFromMetrics(metrics);
  if (hasAnyMeasurement(fromMetrics)) {
    return fromMetrics;
  }

  const start = normalizeBodyMeasurements(startMeasurements);
  if (hasAnyMeasurement(start)) {
    return start;
  }

  return current;
}

export function resolveProfileMeasurements(
  profile: Profile,
  metrics: MeasurementMetric[] = [],
): Profile {
  return {
    ...profile,
    currentMeasurements: resolveCurrentMeasurements(
      profile.startMeasurements,
      profile.currentMeasurements,
      metrics,
    ),
  };
}

export function profileToUserUpdateData(profile: Profile) {
  return {
    name: profile.name.trim(),
    lastName: profile.lastName.trim(),
    phone: profile.phone.trim(),
    goal: profile.goal,
    startWeight: profile.startWeight,
    currentWeight: profile.currentWeight,
    ...startMeasurementsToUserData(profile.startMeasurements),
    ...currentMeasurementsToUserData(profile.currentMeasurements),
  };
}
