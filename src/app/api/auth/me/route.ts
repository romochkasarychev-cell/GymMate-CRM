import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { getAuthProfile } from "@/lib/server/auth-service";
import { getSessionUser } from "@/lib/server/auth-user";

export async function GET(request: Request) {
  return withLoggedHandler("GET /api/auth/me", request, async () => {
    try {
      const user = await getSessionUser(request);

      if (!user) {
        return jsonResponse({ user: null });
      }

      const profile = await getAuthProfile(user.id);

      return jsonResponse({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
        },
        profile,
      });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
