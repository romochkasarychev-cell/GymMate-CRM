import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getDemoUser } from "@/lib/server/demo-user";
import {
  deleteWorkout,
  getWorkout,
  updateWorkout,
  workoutInputFromClient,
} from "@/lib/server/workout-service";
import type { Workout } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await getDemoUser();
    const { id } = await context.params;
    const workout = await getWorkout(user.id, id);
    return jsonResponse({ workout });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getDemoUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      workout: Workout;
      exercises: { id: string; name: string }[];
    };

    const updated = await updateWorkout(
      user.id,
      id,
      workoutInputFromClient(body.workout, body.exercises),
    );

    return jsonResponse({ workout: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getDemoUser();
    const { id } = await context.params;
    await deleteWorkout(user.id, id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
