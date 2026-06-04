import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { patchStartMeasurement } from "../src/lib/measurements";
import { mapUserToProfile, profileToUserUpdateData } from "../src/lib/profile-mapper";
import { updateProfile } from "../src/lib/server/profile-service";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.DEMO_USER_EMAIL ?? "demo@gymmate.local";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  const before = mapUserToProfile(user);
  console.log("Before shoulders:", before.startMeasurements.shoulders);

  const next = patchStartMeasurement(before, "shoulders", 119);
  const updated = await updateProfile(user.id, next);
  console.log("After shoulders:", updated.startMeasurements.shoulders);

  const fromDb = await prisma.user.findUnique({ where: { email } });
  console.log("DB shoulders:", fromDb?.startShoulders);
  console.log("Update payload:", profileToUserUpdateData(next).startShoulders);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
