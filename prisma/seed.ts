import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/lib/password";
import {
  articles,
  bodyMetrics,
  exercises,
  profile,
  workouts,
} from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  const demoEmail = process.env.DEMO_USER_EMAIL ?? profile.email;
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? "demo123";
  const passwordHash = await hashPassword(demoPassword);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: profile.name,
      lastName: profile.lastName,
      phone: profile.phone,
      goal: profile.goal,
      startWeight: profile.startWeight,
      currentWeight: profile.currentWeight,
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      email: demoEmail,
      name: profile.name,
      lastName: profile.lastName,
      phone: profile.phone,
      goal: profile.goal,
      startWeight: profile.startWeight,
      currentWeight: profile.currentWeight,
      status: "ACTIVE",
      passwordHash,
    },
  });

  const exerciseIdByKey = new Map<string, string>();

  for (const exercise of exercises) {
    const record = await prisma.exercise.upsert({
      where: {
        name_muscleGroup: {
          name: exercise.name,
          muscleGroup: exercise.muscleGroup,
        },
      },
      update: {},
      create: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
    });

    exerciseIdByKey.set(`${exercise.muscleGroup}:${exercise.name}`, record.id);
    exerciseIdByKey.set(exercise.id, record.id);
  }

  await prisma.workoutSet.deleteMany({
    where: { workout: { userId: user.id } },
  });
  await prisma.workout.deleteMany({ where: { userId: user.id } });

  for (const workout of workouts) {
    await prisma.workout.create({
      data: {
        userId: user.id,
        date: workout.date,
        label: workout.label,
        notes: workout.notes,
        sets: {
          create: workout.sets.map((set) => {
            const exerciseId =
              exerciseIdByKey.get(set.exerciseId) ??
              exerciseIdByKey.get(`${set.exerciseName}`) ??
              [...exerciseIdByKey.values()][0];

            if (!exerciseId) {
              throw new Error(`Exercise not found for set ${set.id}`);
            }

            return {
              exerciseId,
              exerciseName: set.exerciseName,
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
            };
          }),
        },
      },
    });
  }

  await prisma.bodyMetric.deleteMany({ where: { userId: user.id } });

  for (const metric of bodyMetrics) {
    await prisma.bodyMetric.create({
      data: {
        userId: user.id,
        date: metric.date,
        weight: metric.weight,
      },
    });
  }

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        category: article.category,
      },
      create: {
        title: article.title,
        slug: article.slug,
        content: article.content,
        category: article.category,
      },
    });
  }

  console.log(
    `Seeded demo user ${user.email} (password: ${demoPassword}), ${exercises.length} exercises, ${workouts.length} workouts.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
