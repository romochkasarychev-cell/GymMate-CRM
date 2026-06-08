import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import {
  updateProfile,
  type ProfileUpdateOptions,
} from "@/lib/server/profile-service";
import { requireSessionUser } from "@/lib/server/auth-user";
import type { Profile } from "@/lib/types";

export async function PATCH(request: Request) {
  return withLoggedHandler("PATCH /api/profile", request, async () => {
    try {
      const user = await requireSessionUser(request);
      const body = (await request.json()) as {
        profile: Profile;
      } & ProfileUpdateOptions;

      const profile = await updateProfile(user.id, body.profile, {
        previousWeight: body.previousWeight,
        previousStartWeight: body.previousStartWeight,
        previousStartMeasurement: body.previousStartMeasurement,
        previousCurrentMeasurement: body.previousCurrentMeasurement,
        measurementUpdate: body.measurementUpdate,
      });

      return jsonResponse({ profile });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
