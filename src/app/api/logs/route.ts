import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import { requireAdminUser } from "@/lib/server/auth-user";
import { listApiLogs } from "@/lib/server/log-service";

export async function GET(request: Request) {
  return withLoggedHandler("GET /api/logs", request, async () => {
    try {
      await requireAdminUser(request);

      const { searchParams } = new URL(request.url);
      const limit = Number.parseInt(searchParams.get("limit") ?? "100", 10);
      const level = searchParams.get("level") ?? undefined;

      const logs = await listApiLogs({ limit, level });

      return jsonResponse({ logs });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
