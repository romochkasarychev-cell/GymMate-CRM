"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: Record<string, unknown>) => void;
  }
}

const SWAGGER_UI_VERSION = "5.21.0";

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css`;
    document.head.appendChild(stylesheet);

    const script = document.createElement("script");
    script.src = `https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js`;
    script.async = true;

    script.onload = () => {
      window.SwaggerUIBundle?.({
        url: "/api/openapi",
        domNode: container,
        deepLinking: true,
        persistAuthorization: true,
        tryItOutEnabled: true,
        requestInterceptor: (request: { credentials?: RequestCredentials }) => {
          request.credentials = "include";
          return request;
        },
      });
    };

    document.body.appendChild(script);

    return () => {
      stylesheet.remove();
      script.remove();
      container.replaceChildren();
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div ref={containerRef} />
    </main>
  );
}
