import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getArticleBySlug } from "@/lib/mock-data";
import { articleCategoryLabels } from "@/lib/labels";
import { cn } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function renderMarkdown(content: string) {
  return content.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return (
        <h2
          key={index}
          className="font-heading mt-8 text-2xl font-normal uppercase tracking-wide first:mt-0"
        >
          {line.replace("# ", "")}
        </h2>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h3
          key={index}
          className="font-heading mt-6 text-lg font-normal uppercase tracking-wide text-primary"
        >
          {line.replace("## ", "")}
        </h3>
      );
    }

    if (line.startsWith("- ")) {
      return (
        <li key={index} className="ml-4 list-disc text-muted-foreground marker:text-primary">
          {line.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    }

    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    return (
      <p key={index} className="leading-relaxed text-muted-foreground">
        {line.replace(/\*\*(.*?)\*\*/g, "$1")}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-8">
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

      <Card className="gym-stat-card border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <Badge
            variant="secondary"
            className="w-fit border-primary/20 bg-primary/10 text-primary"
          >
            {articleCategoryLabels[article.category]}
          </Badge>
          <CardTitle className="font-heading text-3xl font-normal uppercase tracking-wide">
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-8">{renderMarkdown(article.content)}</CardContent>
      </Card>
    </div>
  );
}
