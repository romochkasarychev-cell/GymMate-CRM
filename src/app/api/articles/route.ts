import { errorResponse, jsonResponse } from "@/lib/api/http";
import { listArticles } from "@/lib/server/article-service";

export async function GET() {
  try {
    const articles = await listArticles();
    return jsonResponse({ articles });
  } catch (error) {
    return errorResponse(error);
  }
}
