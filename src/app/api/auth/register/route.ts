import { errorResponse, jsonResponseWithSession } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { registerUser } from "@/lib/server/auth-service";

export async function POST(request: Request) {
  return withLoggedHandler("POST /api/auth/register", request, async () => {
    try {
      const body = (await request.json()) as {
        email?: string;
        password?: string;
        name?: string;
        lastName?: string;
      };

      const { user, token } = await registerUser({
        email: body.email ?? "",
        password: body.password ?? "",
        name: body.name ?? "",
        lastName: body.lastName,
      });

      return jsonResponseWithSession({ user }, token, 201);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
