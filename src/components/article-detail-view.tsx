"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { renderArticleMarkdown } from "@/lib/article-content";
import { deleteArticleById } from "@/lib/article-storage";
import { articleCategoryLabels } from "@/lib/labels";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArticleDetailViewProps = {
  article: Article;
};

export function ArticleDetailView({ article: initialArticle }: ArticleDetailViewProps) {
  const router = useRouter();
  const [article] = useState(initialArticle);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!article) {
    notFound();
  }

  async function handleDeleteConfirm() {
    setDeleting(true);

    try {
      const deleted = await deleteArticleById(article.id);

      if (deleted) {
        router.push("/knowledge");
      }
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-8">
      <ConfirmDialog
        open={deleteOpen}
        title="Удалить статью?"
        description="Действие нельзя отменить. Статья будет удалена из базы знаний."
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <Link
        href="/knowledge"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "px-0 text-muted-foreground hover:text-primary",
        )}
      >
        <ArrowLeft className="size-4" />
        К базе знаний
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Badge
            variant="secondary"
            className="w-fit border-primary/20 bg-primary/10 text-primary"
          >
            {articleCategoryLabels[article.category]}
          </Badge>
          <h1 className="gym-page-title break-words">{article.title}</h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={`/knowledge/${article.slug}/edit`}
            className={cn(buttonVariants({ variant: "outline" }), "border-primary/30")}
          >
            <Pencil className="size-4" />
            Редактировать
          </Link>
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Удалить
          </Button>
        </div>
      </div>

      <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg font-normal uppercase tracking-wide">
            Содержание
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-8">
          {renderArticleMarkdown(article.content)}
        </CardContent>
      </Card>
    </div>
  );
}
