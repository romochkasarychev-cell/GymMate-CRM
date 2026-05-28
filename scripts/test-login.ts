import "dotenv/config";
import { verifyPassword } from "../src/lib/password";
import { verifySessionToken, createSession } from "../src/lib/session";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  const email = "demo@gymmate.local";
  const password = "demo123";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    throw new Error("Demo user missing or has no password");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  console.log("Password valid:", valid);

  if (!valid) {
    throw new Error("Demo password verification failed");
  }

  // Session token roundtrip (without cookies API)
  const { SignJWT } = await import("jose");
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const session = await verifySessionToken(token);
  console.log("Session verify:", session);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
