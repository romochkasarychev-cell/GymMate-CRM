import { prisma } from "@/lib/prisma";
import type { ApiLogEntry, LogLevel } from "@/lib/types";

const VALID_LEVELS = new Set<LogLevel>(["debug", "info", "warn", "error"]);

function mapLog(record: {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  route: string | null;
  method: string | null;
  path: string | null;
  status: number | null;
  durationMs: number | null;
  userEmail: string | null;
}): ApiLogEntry {
  return {
    id: record.id,
    timestamp: record.timestamp.toISOString(),
    level: VALID_LEVELS.has(record.level as LogLevel)
      ? (record.level as LogLevel)
      : "info",
    message: record.message,
    route: record.route ?? undefined,
    method: record.method ?? undefined,
    path: record.path ?? undefined,
    status: record.status ?? undefined,
    durationMs: record.durationMs ?? undefined,
    userEmail: record.userEmail ?? undefined,
  };
}

export async function listApiLogs(options: {
  limit?: number;
  level?: string;
}) {
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 200);
  const level = options.level?.trim();

  const logs = await prisma.apiLog.findMany({
    where: level ? { level } : undefined,
    orderBy: { timestamp: "desc" },
    take: limit,
  });

  return logs.map(mapLog);
}
