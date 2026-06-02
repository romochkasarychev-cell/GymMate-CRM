import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getDemoUser } from "@/lib/server/demo-user";
import { updateProfile } from "@/lib/server/profile-service";
import type { Profile } from "@/lib/types";

export async function PATCH(request: Request) {
  try {
    const user = await getDemoUser();
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
