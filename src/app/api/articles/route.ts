import { errorResponse, jsonResponse } from "@/lib/api/http";
import { createArticle, listArticles } from "@/lib/server/article-service";
import type { ArticleCategory } from "@/lib/types";

export async function GET() {
  try {
    const articles = await listArticles();
    return jsonResponse({ articles });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: ArticleCategory;
    };

    const article = await createArticle({
      title: body.title ?? "",
      description: body.description ?? "",
      category: body.category ?? "TRAINING",
    });

    return jsonResponse({ article }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
