import { errorResponse, jsonResponse } from "@/lib/api/http";
import { deleteExercise } from "@/lib/server/exercise-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteExercise(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
