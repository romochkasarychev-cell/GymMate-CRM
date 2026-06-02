import { prisma } from "@/lib/prisma";
import type { Article } from "@/lib/types";

export async function listArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return articles.map(
    (article): Article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
    }),
  );
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return null;

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    category: article.category,
  } satisfies Article;
}
