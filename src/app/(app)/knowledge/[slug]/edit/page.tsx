import { notFound } from "next/navigation";
import { ArticleEditView } from "@/components/article-edit-view";
import { getArticleBySlug as getMockArticleBySlug } from "@/lib/mock-data";
import { getArticleBySlug as getDbArticleBySlug } from "@/lib/server/article-service";

type ArticleEditPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleEditPage({ params }: ArticleEditPageProps) {
  const { slug } = await params;

  if (process.env.NEXT_PUBLIC_USE_API === "true") {
    const article = await getDbArticleBySlug(slug);

    if (!article) {
      notFound();
    }

    return <ArticleEditView article={article} />;
  }

  const article = getMockArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <ArticleEditView article={article} />;
}
