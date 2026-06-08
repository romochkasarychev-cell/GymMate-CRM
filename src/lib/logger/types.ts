export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEvent = {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: "gymmate-crm";
  environment: string;
  context?: Record<string, unknown>;
};
