import type { Article } from "@/lib/types";
import { articles as mockArticles } from "@/lib/mock-data";
import { isApiEnabled, removeArticle } from "@/lib/gymmate-api";

export const ARTICLES_STORAGE_KEY = "gymmate:articles";

export function loadLocalArticles(): Article[] {
  if (typeof window === "undefined") {
    return mockArticles;
  }

  const raw = window.localStorage.getItem(ARTICLES_STORAGE_KEY);

  if (!raw) {
    return mockArticles;
  }

  try {
    return JSON.parse(raw) as Article[];
  } catch {
    return mockArticles;
  }
}

export function saveLocalArticles(articles: Article[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ARTICLES_STORAGE_KEY, JSON.stringify(articles));
}

export function updateLocalArticle(id: string, patch: Partial<Article>) {
  const articles = loadLocalArticles();
  const index = articles.findIndex((article) => article.id === id);

  if (index === -1) {
    return null;
  }

  const next = { ...articles[index], ...patch };
  articles[index] = next;
  saveLocalArticles(articles);
  return next;
}

export function deleteLocalArticle(id: string) {
  const articles = loadLocalArticles();
  const next = articles.filter((article) => article.id !== id);

  if (next.length === articles.length) {
    return false;
  }

  saveLocalArticles(next);
  return true;
}

export function getLocalArticleBySlug(slug: string) {
  return loadLocalArticles().find((article) => article.slug === slug) ?? null;
}

export async function deleteArticleById(id: string) {
  if (isApiEnabled()) {
    await removeArticle(id);
    return true;
  }

  return deleteLocalArticle(id);
}
