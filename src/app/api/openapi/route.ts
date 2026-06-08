import { withLoggedHandler } from "@/lib/api/with-logging";
import { openApiDocument } from "@/lib/openapi/document";

export async function GET(request: Request) {
  return withLoggedHandler("GET /api/openapi", request, async () => {
    return Response.json(openApiDocument);
  });
}
