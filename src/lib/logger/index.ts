import { publishLogEvent } from "@/lib/logger/kafka-transport";
import type { LogEvent, LogLevel } from "@/lib/logger/types";

function writeToConsole(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload = context ? `${message} ${JSON.stringify(context)}` : message;

  switch (level) {
    case "debug":
      console.debug(payload);
      break;
    case "info":
      console.info(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "error":
      console.error(payload);
      break;
  }
}

function buildEvent(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): LogEvent {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: "gymmate-crm",
    environment: process.env.NODE_ENV ?? "development",
    ...(context ? { context } : {}),
  };
}

async function emit(level: LogLevel, message: string, context?: Record<string, unknown>) {
  writeToConsole(level, message, context);
  void publishLogEvent(buildEvent(level, message, context));
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => emit("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => emit("error", message, context),
};

export { disconnectKafkaLogger, isKafkaLoggingEnabled } from "@/lib/logger/kafka-transport";
export type { LogEvent, LogLevel } from "@/lib/logger/types";
