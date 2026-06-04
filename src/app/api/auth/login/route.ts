import { ApiErrors } from "@/lib/api/errors";
import { errorResponse, jsonResponseWithSession } from "@/lib/api/http";
import { loginUser } from "@/lib/server/auth-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      throw ApiErrors.badRequest("Email and password are required");
    }

    const { user, token } = await loginUser({
      email: body.email,
      password: body.password,
    });

    return jsonResponseWithSession({ user }, token);
  } catch (error) {
    return errorResponse(error);
  }
}
