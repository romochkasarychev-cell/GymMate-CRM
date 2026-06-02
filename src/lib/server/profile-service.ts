import { prisma } from "@/lib/prisma";
import { ApiErrors } from "@/lib/api/errors";
import type { Profile } from "@/lib/types";

export async function updateProfile(userId: string, profile: Profile, previousWeight?: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: profile.name.trim(),
      lastName: profile.lastName.trim(),
      phone: profile.phone.trim(),
      goal: profile.goal,
      startWeight: profile.startWeight,
      currentWeight: profile.currentWeight,
    },
  });

  if (previousWeight !== undefined && profile.currentWeight !== previousWeight) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const sameDay = await prisma.bodyMetric.findFirst({
      where: {
        userId,
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    });

    if (sameDay) {
      await prisma.bodyMetric.update({
        where: { id: sameDay.id },
        data: { weight: profile.currentWeight },
      });
    } else {
      await prisma.bodyMetric.create({
        data: {
          userId,
          date: today,
          weight: profile.currentWeight,
        },
      });
    }
  }

  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    goal: user.goal,
    startWeight: user.startWeight,
    currentWeight: user.currentWeight,
  } satisfies Profile;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return {
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    goal: user.goal,
    startWeight: user.startWeight,
    currentWeight: user.currentWeight,
  } satisfies Profile;
}
