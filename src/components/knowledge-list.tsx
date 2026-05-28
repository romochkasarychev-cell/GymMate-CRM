"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { articles } from "@/lib/mock-data";
import { articleCategoryLabels } from "@/lib/labels";
import type { ArticleCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryTabs: { id: ArticleCategory; label: string }[] = [
  { id: "TRAINING", label: "Тренировки" },
  { id: "NUTRITION", label: "Питание" },
  { id: "RECOVERY", label: "Восстановление" },
];

export function KnowledgeList() {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory>("TRAINING");

  const filteredArticles = articles.filter(
    (article) => article.category === activeCategory,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="База знаний"
        description="Полезные материалы для прогресса в зале"
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
                  <CardDescription>
                    {article.content
                      .split("\n")
                      .find((line) => line.trim())
                      ?.replace(/^#+\s*/, "")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
