import { errorResponse, jsonResponse } from "@/lib/api/http";
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
  try {
    const { id } = await context.params;
    const article = await getArticleById(id);
    return jsonResponse({ article });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await deleteArticle(id);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
