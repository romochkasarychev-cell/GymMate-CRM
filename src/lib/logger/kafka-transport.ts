import { Kafka, type Producer, logLevel } from "kafkajs";
import type { LogEvent } from "@/lib/logger/types";

let producer: Producer | null = null;
let connectPromise: Promise<Producer | null> | null = null;
let kafkaDisabled = false;

function parseBrokers() {
  const raw = process.env.KAFKA_BROKERS?.trim();
  if (!raw) {
    return [];
  }

  return raw.split(",").map((broker) => broker.trim()).filter(Boolean);
}

export function isKafkaLoggingEnabled() {
  if (kafkaDisabled) {
    return false;
  }

  if (process.env.KAFKA_ENABLED === "false") {
    return false;
  }

  return parseBrokers().length > 0;
}

function getTopic() {
  return process.env.KAFKA_LOG_TOPIC?.trim() || "gymmate-logs";
}

function getClientId() {
  return process.env.KAFKA_CLIENT_ID?.trim() || "gymmate-crm";
}

async function getProducer() {
  if (!isKafkaLoggingEnabled()) {
    return null;
  }

  if (producer) {
    return producer;
  }

  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        const kafka = new Kafka({
          clientId: getClientId(),
          brokers: parseBrokers(),
          logLevel: logLevel.ERROR,
          retry: {
            initialRetryTime: 300,
            retries: 3,
          },
        });

        const nextProducer = kafka.producer();
        await nextProducer.connect();
        producer = nextProducer;
        return nextProducer;
      } catch (error) {
        kafkaDisabled = true;
        console.error("[kafka-logger] Failed to connect, logging to console only:", error);
        return null;
      } finally {
        connectPromise = null;
      }
    })();
  }

  return connectPromise;
}

export async function publishLogEvent(event: LogEvent) {
  const activeProducer = await getProducer();
  if (!activeProducer) {
    return;
  }

  try {
    await activeProducer.send({
      topic: getTopic(),
      messages: [
        {
          key: event.level,
          value: JSON.stringify(event),
          timestamp: String(new Date(event.timestamp).getTime()),
        },
      ],
    });
  } catch (error) {
    kafkaDisabled = true;
    console.error("[kafka-logger] Failed to publish log event:", error);
  }
}

export async function disconnectKafkaLogger() {
  if (!producer) {
    return;
  }

  await producer.disconnect();
  producer = null;
}
