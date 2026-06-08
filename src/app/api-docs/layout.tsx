import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GymMate API — Swagger",
  description: "OpenAPI документация и тестирование REST API GymMate CRM",
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
