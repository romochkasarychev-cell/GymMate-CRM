import "dotenv/config";
import { Kafka, logLevel } from "kafkajs";

const topic = process.env.KAFKA_LOG_TOPIC?.trim() || "gymmate-logs";
const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
  .split(",")
  .map((broker) => broker.trim())
  .filter(Boolean);
const groupId = process.env.KAFKA_CONSUMER_GROUP?.trim() || "gymmate-log-consumer";

async function main() {
  const kafka = new Kafka({
    clientId: "gymmate-log-consumer",
    brokers,
    logLevel: logLevel.ERROR,
  });

  const consumer = kafka.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  console.log(`Listening to Kafka topic "${topic}" on ${brokers.join(", ")}`);
  console.log("Press Ctrl+C to stop.\n");

  await consumer.run({
    eachMessage: async ({ message, partition, topic: messageTopic }) => {
      const raw = message.value?.toString();

      if (!raw) {
        return;
      }

      try {
        const event = JSON.parse(raw) as {
          timestamp?: string;
          level?: string;
          message?: string;
          context?: Record<string, unknown>;
        };

        const prefix = `[${event.level ?? "info"}] ${event.timestamp ?? ""}`;
        const context = event.context ? ` ${JSON.stringify(event.context)}` : "";

        console.log(`${prefix} ${event.message ?? raw}${context}`);
      } catch {
        console.log(`[${messageTopic}:${partition}] ${raw}`);
      }
    },
  });
}

main().catch((error) => {
  console.error("Kafka consumer failed:", error);
  process.exit(1);
});
