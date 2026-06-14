import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { searchFoods } from "@/lib/server/food-service";

export async function GET(request: Request) {
  return withLoggedHandler("GET /api/foods", request, async () => {
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q") ?? "";
      const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);

      const foods = await searchFoods(query, limit);
      return jsonResponse({ foods, total: foods.length });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
