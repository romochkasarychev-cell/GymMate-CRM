import { errorResponse, jsonResponse } from "@/lib/api/http";
import { requireSessionUser } from "@/lib/server/auth-user";
import { updateProfile } from "@/lib/server/profile-service";
import type { Profile } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser(request);
    const body = (await request.json()) as {
      profile: Profile;
      previousWeight?: number;
    };

    const profile = await updateProfile(
      user.id,
      body.profile,
      body.previousWeight,
    );

    return jsonResponse({ profile });
  } catch (error) {
    return errorResponse(error);
  }
}
