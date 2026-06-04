import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getAuthProfile } from "@/lib/server/auth-service";
import { getSessionUser } from "@/lib/server/auth-user";

export async function GET(request: Request) {
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
}
