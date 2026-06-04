import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { resetBodyMetrics } from "../src/lib/server/profile-service";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.DEMO_USER_EMAIL ?? "demo@gymmate.local";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  const baseline = await resetBodyMetrics(user.id);

  console.log(`Reset body metrics for ${email}:`);
  for (const metric of baseline) {
    console.log(`- ${metric.date.toISOString().slice(0, 10)}: ${metric.weight} kg`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
