import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { requireSessionUser } from "@/lib/server/auth-user";
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

export async function GET(request: Request, context: RouteContext) {
  return withLoggedHandler("GET /api/workouts/[id]", request, async () => {
    try {
      const user = await requireSessionUser(request);
      const { id } = await context.params;
      const workout = await getWorkout(user.id, id);
      return jsonResponse({ workout });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withLoggedHandler("PATCH /api/workouts/[id]", request, async () => {
    try {
      const user = await requireSessionUser(request);
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
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withLoggedHandler("DELETE /api/workouts/[id]", request, async () => {
    try {
      const user = await requireSessionUser(request);
      const { id } = await context.params;
      await deleteWorkout(user.id, id);
      return jsonResponse({ ok: true });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
