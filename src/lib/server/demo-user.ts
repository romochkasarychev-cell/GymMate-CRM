import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";

export function getDemoUserEmail() {
  return process.env.DEMO_USER_EMAIL ?? "demo@gymmate.local";
}

export async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: getDemoUserEmail() },
  });

  if (!user) {
    throw ApiErrors.notFound(
      "Demo user not found. Run npm run db:seed after starting PostgreSQL.",
    );
  }

  return user;
}
