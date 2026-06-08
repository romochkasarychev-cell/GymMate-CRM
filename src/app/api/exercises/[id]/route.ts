import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { deleteExercise } from "@/lib/server/exercise-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  return withLoggedHandler("DELETE /api/exercises/[id]", _request, async () => {
    try {
      const { id } = await context.params;
      await deleteExercise(id);
      return jsonResponse({ ok: true });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
