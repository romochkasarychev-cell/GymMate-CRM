"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchLogs, isApiEnabled } from "@/lib/gymmate-api";
import type { ApiLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const levelLabels: Record<ApiLogEntry["level"], string> = {
  debug: "Debug",
  info: "Info",
  warn: "Warn",
  error: "Error",
};

const levelStyles: Record<ApiLogEntry["level"], string> = {
  debug: "border-border/60 bg-secondary/40 text-muted-foreground",
  info: "border-primary/30 bg-primary/10 text-primary",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function LogsView() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [level, setLevel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!isApiEnabled()) {
      setError("Логи доступны только при NEXT_PUBLIC_USE_API=true");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchLogs({
        limit: 100,
        level: level === "all" ? undefined : level,
      });
      setLogs(data.logs);
    } catch {
      setError("Не удалось загрузить логи. Доступ только для администратора.");
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Логи API"
        description="Журнал запросов и ошибок приложения"
        action={
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => void loadLogs()}
            disabled={loading}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Обновить
          </Button>
        }
      />

      <Card className="gym-card-hover border-border/70 bg-card/80 backdrop-blur-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-heading text-xl font-normal uppercase tracking-wide">
              <ScrollText className="size-5 text-primary" />
              Последние события
            </CardTitle>
            <CardDescription>
              Показываются последние 100 записей из базы данных
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "info", "warn", "error"].map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={level === item ? "default" : "outline"}
                className={level === item ? "gym-btn-primary" : undefined}
                onClick={() => setLevel(item)}
              >
                {item === "all" ? "Все" : levelLabels[item as ApiLogEntry["level"]]}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {loading && logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Загрузка логов...</p>
          ) : null}

          {!loading && !error && logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Записей пока нет. Выполните несколько API-запросов, чтобы они появились
              здесь.
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Время</th>
                  <th className="px-3 py-2 font-medium">Уровень</th>
                  <th className="px-3 py-2 font-medium">Сообщение</th>
                  <th className="px-3 py-2 font-medium">Метод</th>
                  <th className="px-3 py-2 font-medium">Путь</th>
                  <th className="px-3 py-2 font-medium">Статус</th>
                  <th className="px-3 py-2 font-medium">мс</th>
                  <th className="px-3 py-2 font-medium">Пользователь</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/40 align-top">
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="outline" className={levelStyles[log.level]}>
                        {levelLabels[log.level]}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">{log.message}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{log.method ?? "—"}</td>
                    <td className="px-3 py-3 font-mono text-xs">{log.path ?? "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{log.status ?? "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{log.durationMs ?? "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                      {log.userEmail ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
