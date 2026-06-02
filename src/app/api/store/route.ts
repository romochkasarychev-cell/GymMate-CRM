import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getDemoUser } from "@/lib/server/demo-user";
import { loadUserStore } from "@/lib/server/store-service";

export async function GET() {
  try {
    const user = await getDemoUser();
    const store = await loadUserStore(user.id);
    return jsonResponse(store);
  } catch (error) {
    return errorResponse(error);
  }
}
