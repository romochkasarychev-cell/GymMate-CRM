export type Goal = "WEIGHT_LOSS" | "MUSCLE_GAIN" | "STRENGTH";

export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "ARMS"
  | "CORE";

export type ArticleCategory = "NUTRITION" | "TRAINING" | "RECOVERY";

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

export type Profile = {
  name: string;
  email: string;
  goal: Goal;
  currentWeight: number;
};
