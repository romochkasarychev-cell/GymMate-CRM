"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createArticleSlug } from "@/lib/article-utils";
import { updateLocalArticle } from "@/lib/article-storage";
import { isApiEnabled, patchArticle } from "@/lib/gymmate-api";
import { articleCategoryLabels } from "@/lib/labels";
import type { Article, ArticleCategory } from "@/lib/types";

const categoryOptions: ArticleCategory[] = ["TRAINING", "NUTRITION", "RECOVERY"];

type ArticleFormProps = {
  article?: Article;
  defaultCategory?: ArticleCategory;
};

export function ArticleForm({ article, defaultCategory = "TRAINING" }: ArticleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(article);

  const [title, setTitle] = useState(article?.title ?? "");
  const [description, setDescription] = useState(article?.content ?? "");
  const [category, setCategory] = useState<ArticleCategory>(
    article?.category ?? defaultCategory,
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
      };

      if (isEditing && article) {
        if (isApiEnabled()) {
          const updated = await patchArticle(article.id, payload);
          router.push(`/knowledge/${updated.slug}`);
          return;
        }

        const slug =
          payload.title !== article.title
            ? createArticleSlug(payload.title)
            : article.slug;

        const updated = updateLocalArticle(article.id, {
          title: payload.title,
          content: payload.description,
          category: payload.category,
          slug,
        });

        if (!updated) {
          throw new Error("Article not found");
        }

        router.push(`/knowledge/${updated.slug}`);
        return;
      }

      setFormError("Создание доступно на странице списка статей.");
    } catch {
      setFormError("Не удалось сохранить статью. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="article-title">Название</Label>
        <Input
          id="article-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, Разминка перед тренировкой"
          required
          disabled={saving}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-category">Категория</Label>
        <Select
          value={category}
          onValueChange={(value) => {
            if (value) setCategory(value as ArticleCategory);
          }}
        >
          <SelectTrigger id="article-category" className="w-full">
            <SelectValue placeholder="Выберите категорию">
              {articleCategoryLabels[category]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {articleCategoryLabels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-description">Описание</Label>
        <Textarea
          id="article-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Краткое описание или содержание статьи"
          rows={8}
          required
          disabled={saving}
        />
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      <Button type="submit" className="gym-btn-primary w-full sm:w-auto" disabled={saving}>
        {saving ? "Сохранение…" : isEditing ? "Сохранить изменения" : "Сохранить"}
      </Button>
    </form>
  );
}
