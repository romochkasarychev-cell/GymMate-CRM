export type Goal = "WEIGHT_LOSS" | "MUSCLE_GAIN" | "STRENGTH";

export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "ARMS"
  | "CORE";

export type ArticleCategory = "NUTRITION" | "TRAINING" | "RECOVERY";

export type WorkoutLabel = "HEAVY" | "MEDIUM" | "LIGHT" | "CARDIO";

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  instructions?: string;
};

export type WorkoutSet = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
};

export type Workout = {
  id: string;
  date: Date;
  label: WorkoutLabel;
  notes?: string;
  sets: WorkoutSet[];
};

export type BodyMetric = {
  date: Date;
  weight: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: ArticleCategory;
};

export type BodyMeasurements = {
  shoulders: number;
  chest: number;
  waist: number;
  hips: number;
  armRight: number;
  armLeft: number;
  legRight: number;
  legLeft: number;
};

/** @deprecated Use BodyMeasurements */
export type StartMeasurements = BodyMeasurements;

export type MeasurementKind =
  | "shoulders"
  | "chest"
  | "waist"
  | "hips"
  | "armRight"
  | "armLeft"
  | "legRight"
  | "legLeft";

export type MeasurementMetric = {
  date: Date;
  kind: MeasurementKind;
  value: number;
};

export type Profile = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  goal: Goal;
  startWeight: number;
  currentWeight: number;
  startMeasurements: BodyMeasurements;
  currentMeasurements: BodyMeasurements;
  registeredAt: Date;
};

export type UserStatus = "ACTIVE" | "INACTIVE";

export type User = {
  id: string;
  name: string;
  email: string;
  goal: Goal;
  startWeight: number;
  currentWeight: number;
  registeredAt: Date;
  status: UserStatus;
  inactiveSince?: Date;
};

export type FoodSource = "BASKOVSKY" | "OPEN_FOOD_FACTS" | "MANUAL";

export type FoodProduct = {
  id: string;
  name: string;
  category?: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  barcode?: string;
  brand?: string;
  source: FoodSource;
};
