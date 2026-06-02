import { errorResponse, jsonResponse } from "@/lib/api/http";
import { addExercise, listExercises } from "@/lib/server/exercise-service";
import type { MuscleGroup } from "@/lib/types";

export async function GET() {
  try {
    const exercises = await listExercises();
    return jsonResponse({ exercises });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name: string;
      muscleGroup: MuscleGroup;
    };

    const exercise = await addExercise(body.name, body.muscleGroup);
    return jsonResponse({ exercise }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
