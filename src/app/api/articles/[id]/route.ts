import { errorResponse, jsonResponse } from "@/lib/api/http";
import { withLoggedHandler } from "@/lib/api/with-logging";
import {
  deleteArticle,
  getArticleById,
  updateArticle,
} from "@/lib/server/article-service";
import type { ArticleCategory } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return withLoggedHandler("GET /api/articles/[id]", _request, async () => {
    try {
      const { id } = await context.params;
      const article = await getArticleById(id);
      return jsonResponse({ article });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withLoggedHandler("PATCH /api/articles/[id]", request, async () => {
    try {
      const { id } = await context.params;
      const body = (await request.json()) as {
        title?: string;
        description?: string;
        category?: ArticleCategory;
      };

      const article = await updateArticle(id, {
        title: body.title ?? "",
        description: body.description ?? "",
        category: body.category ?? "TRAINING",
      });

      return jsonResponse({ article });
    } catch (error) {
      return errorResponse(error);
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withLoggedHandler("DELETE /api/articles/[id]", _request, async () => {
    try {
      const { id } = await context.params;
      await deleteArticle(id);
      return jsonResponse({ ok: true });
    } catch (error) {
      return errorResponse(error);
    }
  });
}
