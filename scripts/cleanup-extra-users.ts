import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const KEEP_EMAIL =
  process.env.DEMO_USER_EMAIL?.trim().toLowerCase() ?? "demo@gymmate.local";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  const toDelete = users.filter(
    (user) => user.email.toLowerCase() !== KEEP_EMAIL,
  );

  if (toDelete.length === 0) {
    console.log(`Nothing to delete. Keeping only ${KEEP_EMAIL}.`);
    return;
  }

  console.log(`Keeping: ${KEEP_EMAIL}`);
  console.log("Deleting:");
  for (const user of toDelete) {
    console.log(`- ${user.email} (${user.name})`);
  }

  const result = await prisma.user.deleteMany({
    where: {
      email: { not: KEEP_EMAIL },
    },
  });

  console.log(`Deleted ${result.count} user(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
