import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.DEMO_USER_EMAIL ?? "demo@gymmate.local";

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
      startWeight: true,
      currentWeight: true,
      updatedAt: true,
    },
  });

  const metrics = await prisma.bodyMetric.findMany({
    where: { userId: user?.id ? { equals: user.id } : undefined },
    orderBy: { date: "asc" },
    select: { date: true, weight: true },
  });

  console.log("User:", user);
  console.log("Body metrics:", metrics);

  await prisma.$disconnect();
}

main().catch(console.error);
