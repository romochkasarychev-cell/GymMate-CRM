"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ArticleFormDialog } from "@/components/article-form-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchArticles, isApiEnabled, postArticle } from "@/lib/gymmate-api";
import { createArticleSlug, getArticlePreview } from "@/lib/article-utils";
import { loadLocalArticles, saveLocalArticles } from "@/lib/article-storage";
import { articles as mockArticles } from "@/lib/mock-data";
import { articleCategoryLabels } from "@/lib/labels";
import type { Article, ArticleCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryTabs: { id: ArticleCategory; label: string }[] = [
  { id: "TRAINING", label: "Тренировки" },
  { id: "NUTRITION", label: "Питание" },
  { id: "RECOVERY", label: "Восстановление" },
];

export function KnowledgeList() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>("TRAINING");
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadArticles = useCallback(async () => {
    if (!isApiEnabled()) {
      setArticles(loadLocalArticles());
      return;
    }

    try {
      const data = await fetchArticles();
      setArticles(data.articles);
    } catch {
      setArticles(loadLocalArticles());
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const filteredArticles = articles.filter(
    (article) => article.category === activeCategory,
  );

  async function handleCreateArticle(data: { title: string; description: string }) {
    setSaving(true);
    setFormError(null);

    try {
      if (isApiEnabled()) {
        const created = await postArticle({
          title: data.title,
          description: data.description,
          category: activeCategory,
        });
        setArticles((current) => [created, ...current]);
      } else {
        const created: Article = {
          id: crypto.randomUUID(),
          title: data.title.trim(),
          slug: createArticleSlug(data.title),
          content: data.description.trim(),
          category: activeCategory,
        };
        setArticles((current) => {
          const next = [created, ...current];
          saveLocalArticles(next);
          return next;
        });
      }

      setDialogOpen(false);
    } catch {
      setFormError("Не удалось сохранить статью. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="База знаний"
        description="Полезные материалы для прогресса в зале"
        action={
          <button
            type="button"
            className={cn(buttonVariants(), "gym-btn-primary")}
            onClick={() => {
              setFormError(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Новая статья
          </button>
        }
      />

      <ArticleFormDialog
        open={dialogOpen}
        category={activeCategory}
        loading={saving}
        error={formError}
        onSubmit={(data) => void handleCreateArticle(data)}
        onCancel={() => {
          if (!saving) {
            setDialogOpen(false);
            setFormError(null);
          }
        }}
      />

      <div className="space-y-4">
        <nav
          className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
          aria-label="Категории базы знаний"
        >
          {categoryTabs.map(({ id, label }) => {
            const active = activeCategory === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className={cn(
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "gym-nav-active"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <p className="text-sm text-muted-foreground">
          {articleCategoryLabels[activeCategory]} — {filteredArticles.length}{" "}
          {filteredArticles.length === 1 ? "статья" : "статей"}
        </p>
      </div>

      {filteredArticles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          В этой категории пока нет статей.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Link key={article.id} href={`/knowledge/${article.slug}`}>
              <Card className="gym-card-hover border-border/70 bg-card/80 py-0 backdrop-blur-sm">
                <CardHeader className="py-4">
                  <Badge
                    variant="secondary"
                    className="w-fit border-primary/20 bg-primary/10 text-primary"
                  >
                    {articleCategoryLabels[article.category]}
                  </Badge>
                  <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
                    {article.title}
                  </CardTitle>
                  <CardDescription>{getArticlePreview(article.content)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
