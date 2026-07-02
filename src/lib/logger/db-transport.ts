import { prisma } from "@/lib/prisma";
import type { LogEvent } from "@/lib/logger/types";

function pickContextField(context: Record<string, unknown> | undefined, key: string) {
  const value = context?.[key];
  return typeof value === "string" ? value : undefined;
}

function pickContextNumber(context: Record<string, unknown> | undefined, key: string) {
  const value = context?.[key];
  return typeof value === "number" ? value : undefined;
}

export async function persistLogEvent(event: LogEvent) {
  await prisma.apiLog.create({
    data: {
      timestamp: new Date(event.timestamp),
      level: event.level,
      message: event.message,
      route: pickContextField(event.context, "route"),
      method: pickContextField(event.context, "method"),
      path: pickContextField(event.context, "path"),
      status: pickContextNumber(event.context, "status"),
      durationMs: pickContextNumber(event.context, "durationMs"),
      userEmail: pickContextField(event.context, "userEmail"),
      context: event.context ? (event.context as object) : undefined,
    },
  });
}
