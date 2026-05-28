import { randomUUID } from "crypto";
import "dotenv/config";
import { hashPassword } from "../src/lib/password";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  const email = "demo@gymmate.local";
  const password = "demo123";

  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash: await hashPassword(password),
      name: "Демо",
      goal: "MUSCLE_GAIN",
      currentWeight: 75,
    },
  });

  console.log("Demo user ready");
  console.log("Email:", user.email);
  console.log("Password:", password);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
