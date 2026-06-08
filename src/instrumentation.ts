export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { isKafkaLoggingEnabled } = await import("@/lib/logger");

    if (isKafkaLoggingEnabled()) {
      console.info("[gymmate] Kafka logging enabled");
    }
  }
}

export async function onShutdown() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { disconnectKafkaLogger } = await import("@/lib/logger");
    await disconnectKafkaLogger();
  }
}
