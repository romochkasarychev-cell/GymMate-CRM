import { clearSessionResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";

export async function POST(request: Request) {
  return withLoggedHandler("POST /api/auth/logout", request, async () => {
    return clearSessionResponse();
  });
}
