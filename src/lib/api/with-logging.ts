import { logger } from "@/lib/logger";
import { getSessionUser } from "@/lib/server/auth-user";

function sanitizePath(pathname: string) {
  return pathname.split("?")[0] ?? pathname;
}

export async function withLoggedHandler(
  route: string,
  request: Request,
  handler: () => Promise<Response>,
) {
  const startedAt = Date.now();
  const { pathname, search } = new URL(request.url);
  const sessionUser = await getSessionUser(request);

  try {
    const response = await handler();
    const durationMs = Date.now() - startedAt;
    const level = response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info";

    void logger[level]("api.request", {
      route,
      method: request.method,
      path: sanitizePath(pathname),
      query: search || undefined,
      status: response.status,
      durationMs,
      userEmail: sessionUser?.email,
    });

    return response;
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    void logger.error("api.request.unhandled", {
      route,
      method: request.method,
      path: sanitizePath(pathname),
      query: search || undefined,
      durationMs,
      userEmail: sessionUser?.email,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
