"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/article-form";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { articleCategoryLabels } from "@/lib/labels";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArticleEditViewProps = {
  article: Article;
};

export function ArticleEditView({ article }: ArticleEditViewProps) {
  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/knowledge/${article.slug}`}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "px-0 text-muted-foreground hover:text-primary",
        )}
      >
        <ArrowLeft className="size-4" />
        К статье
      </Link>

      <PageHeader
        title="Редактирование статьи"
        description={articleCategoryLabels[article.category]}
      />

      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-normal uppercase tracking-wide">
            Материал
          </CardTitle>
          <CardDescription>Измените название, категорию или описание</CardDescription>
        </CardHeader>
        <CardContent>
          <ArticleForm article={article} />
        </CardContent>
      </Card>
    </div>
  );
}
