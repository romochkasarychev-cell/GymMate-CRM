import { errorResponse, jsonResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/server/auth-user";
import { loadUserStore } from "@/lib/server/store-service";

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const store = await loadUserStore(user.id);
    return jsonResponse(store);
  } catch (error) {
    return errorResponse(error);
  }
}
