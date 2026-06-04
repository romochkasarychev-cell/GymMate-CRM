import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import { createArticleSlug } from "@/lib/article-utils";
import type { Article, ArticleCategory } from "@/lib/types";

function mapArticle(article: {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: ArticleCategory;
}): Article {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content,
    category: article.category,
  };
}

export async function listArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
  });

  return articles.map(mapArticle);
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return null;

  return mapArticle(article);
}

export async function getArticleById(id: string) {
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    throw ApiErrors.notFound("Article not found");
  }

  return mapArticle(article);
}

export async function createArticle(input: {
  title: string;
  description: string;
  category: ArticleCategory;
}) {
  const title = input.title.trim();
  const content = input.description.trim();

  if (!title) {
    throw ApiErrors.badRequest("Укажите название статьи");
  }

  if (!content) {
    throw ApiErrors.badRequest("Укажите описание статьи");
  }

  let slug = createArticleSlug(title);
  const slugTaken = await prisma.article.findUnique({ where: { slug } });

  if (slugTaken) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      category: input.category,
    },
  });

  return mapArticle(article);
}

export async function updateArticle(
  id: string,
  input: {
    title: string;
    description: string;
    category: ArticleCategory;
  },
) {
  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    throw ApiErrors.notFound("Article not found");
  }

  const title = input.title.trim();
  const content = input.description.trim();

  if (!title) {
    throw ApiErrors.badRequest("Укажите название статьи");
  }

  if (!content) {
    throw ApiErrors.badRequest("Укажите описание статьи");
  }

  let slug = existing.slug;

  if (title !== existing.title) {
    slug = createArticleSlug(title);
    const slugTaken = await prisma.article.findFirst({
      where: { slug, NOT: { id } },
    });

    if (slugTaken) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      content,
      slug,
      category: input.category,
    },
  });

  return mapArticle(article);
}

export async function deleteArticle(id: string) {
  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    throw ApiErrors.notFound("Article not found");
  }

  await prisma.article.delete({ where: { id } });
  return true;
}
