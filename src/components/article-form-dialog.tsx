"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { articleCategoryLabels } from "@/lib/labels";
import type { ArticleCategory } from "@/lib/types";

type ArticleFormDialogProps = {
  open: boolean;
  category: ArticleCategory;
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: { title: string; description: string }) => void;
  onCancel: () => void;
};

export function ArticleFormDialog({
  open,
  category,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
}: ArticleFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle("");
    setDescription("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ title, description });
  }

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        aria-label="Закрыть"
        disabled={loading}
        onClick={onCancel}
      />
      <Card
        className="relative z-10 w-full max-w-md border-border/70 bg-card/95 shadow-2xl backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-form-title"
      >
        <CardHeader>
          <CardTitle
            id="article-form-title"
            className="font-heading text-xl font-normal uppercase tracking-wide"
          >
            Новая статья
          </CardTitle>
          <CardDescription>
            Категория: {articleCategoryLabels[category]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="article-title">Название</Label>
              <Input
                id="article-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например, Разминка перед тренировкой"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-description">Описание</Label>
              <Textarea
                id="article-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Краткое описание или содержание статьи"
                rows={5}
                required
                disabled={loading}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onCancel}
              >
                Отмена
              </Button>
              <Button type="submit" className="gym-btn-primary" disabled={loading}>
                {loading ? "Сохранение…" : "Сохранить"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
