import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getDemoUser } from "@/lib/server/demo-user";
import {
  createWorkout,
  listWorkouts,
  workoutInputFromClient,
} from "@/lib/server/workout-service";
import type { Workout } from "@/lib/types";

export async function GET() {
  try {
    const user = await getDemoUser();
    const workouts = await listWorkouts(user.id);
    return jsonResponse({ workouts });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getDemoUser();
    const body = (await request.json()) as {
      workout: Workout;
      exercises: { id: string; name: string }[];
    };

    const created = await createWorkout(
      user.id,
      workoutInputFromClient(body.workout, body.exercises),
    );

    return jsonResponse({ workout: created }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
