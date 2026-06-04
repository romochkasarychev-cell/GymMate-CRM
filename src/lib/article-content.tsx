"use client";

export function renderArticleMarkdown(content: string) {
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

export function getArticlePreview(content: string) {
  return (
    content
      .split("\n")
      .find((line) => line.trim())
      ?.replace(/^#+\s*/, "") ?? content
  );
}
