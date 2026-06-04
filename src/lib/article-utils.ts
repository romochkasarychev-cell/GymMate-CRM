export function createArticleSlug(title: string) {
  const ascii = title
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (ascii.length >= 3) {
    return ascii;
  }

  return `article-${Date.now().toString(36)}`;
}

export function getArticlePreview(content: string) {
  return (
    content
      .split("\n")
      .find((line) => line.trim())
      ?.replace(/^#+\s*/, "") ?? content
  );
}
