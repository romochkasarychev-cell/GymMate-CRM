import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { requireSessionUser } from "@/lib/server/auth-user";
import { loadUserStore } from "@/lib/server/store-service";

export async function GET(request: Request) {
  return withLoggedHandler("GET /api/store", request, async () => {
    try {
      const user = await requireSessionUser(request);
      const store = await loadUserStore(user.id);
      return jsonResponse(store);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
