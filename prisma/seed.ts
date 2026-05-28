import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const exercises = [
  { name: "Жим штанги лёжа", muscleGroup: "CHEST" as const, instructions: "Лопатки сведены, контролируемое опускание." },
  { name: "Приседания со штангой", muscleGroup: "LEGS" as const, instructions: "Колени следуют за носками, спина нейтральная." },
  { name: "Становая тяга", muscleGroup: "BACK" as const, instructions: "Штанга близко к телу, корпус стабилен." },
  { name: "Подтягивания", muscleGroup: "BACK" as const, instructions: "Полная амплитуда, без рывков." },
  { name: "Жим штанги стоя", muscleGroup: "SHOULDERS" as const, instructions: "Корпус напряжён, штанга над головой." },
  { name: "Тяга штанги в наклоне", muscleGroup: "BACK" as const, instructions: "Спина параллельна полу, локти к корпусу." },
  { name: "Румынская тяга", muscleGroup: "LEGS" as const, instructions: "Таз назад, растяжение задней поверхности бедра." },
  { name: "Выпады с гантелями", muscleGroup: "LEGS" as const, instructions: "Колено не выходит далеко за носок." },
  { name: "Разведение гантелей лёжа", muscleGroup: "CHEST" as const, instructions: "Лёгкий изгиб в локтях, контроль внизу." },
  { name: "Подъём штанги на бицепс", muscleGroup: "ARMS" as const, instructions: "Локти зафиксированы, без раскачивания." },
  { name: "Французский жим", muscleGroup: "ARMS" as const, instructions: "Локти смотрят вперёд, медленное опускание." },
  { name: "Жим ногами", muscleGroup: "LEGS" as const, instructions: "Полная амплитуда, не блокируйте колени резко." },
  { name: "Сгибание ног лёжа", muscleGroup: "LEGS" as const, instructions: "Контролируйте негативную фазу." },
  { name: "Разгибание ног сидя", muscleGroup: "LEGS" as const, instructions: "Плавное движение, пауза в верхней точке." },
  { name: "Жим гантелей сидя", muscleGroup: "SHOULDERS" as const, instructions: "Не прогибайте поясницу в верхней точке." },
  { name: "Тяга блока к груди", muscleGroup: "BACK" as const, instructions: "Сводите лопатки в конце движения." },
  { name: "Планка", muscleGroup: "CORE" as const, instructions: "Тело в одну линию, напряжённый кор." },
  { name: "Скручивания", muscleGroup: "CORE" as const, instructions: "Поднимайте лопатки, не тяните шею руками." },
  { name: "Гиперэкстензия", muscleGroup: "BACK" as const, instructions: "Контролируйте подъём и опускание корпуса." },
  { name: "Отжимания", muscleGroup: "CHEST" as const, instructions: "Корпус прямой, грудь почти к полу." },
];

const articles = [
  {
    title: "С чего начать в тренажёрном зале",
    slug: "start-in-gym",
    category: "TRAINING" as const,
    content: `# С чего начать

Выберите 3–4 базовых упражнения на всё тело и тренируйтесь 2–3 раза в неделю.

## Базовый план
- Приседания или жим ногами
- Жим лёжа или отжимания
- Тяга (штанга, блок или подтягивания)
- Планка или скручивания

Добавляйте вес постепенно, когда выполняете все подходы с хорошей техникой.`,
  },
  {
    title: "Сколько белка нужно для роста мышц",
    slug: "protein-guide",
    category: "NUTRITION" as const,
    content: `# Белок и мышцы

Для большинства людей достаточно **1.6–2.2 г белка на кг веса** в сутки.

## Практика
- Распределяйте белок на 3–4 приёма пищи
- После тренировки — полноценный приём с белком и углеводами
- Не забывайте про воду и сон`,
  },
  {
    title: "Как восстанавливаться между тренировками",
    slug: "recovery-basics",
    category: "RECOVERY" as const,
    content: `# Восстановление

Рост происходит не в зале, а во время отдыха.

## Основы
- **Сон:** 7–9 часов
- **Питание:** достаточно калорий и белка
- **Нагрузка:** не тренируйте одну группу мышц каждый день

Если постоянная усталость — снизьте объём или интенсивность на неделю.`,
  },
  {
    title: "Как прогрессировать в базовых упражнениях",
    slug: "progressive-overload",
    category: "TRAINING" as const,
    content: `# Прогрессия нагрузки

Добавляйте вес, повторы или подходы, когда текущий объём даётся уверенно.

## Простое правило
Если выполнили верхнюю границу повторений во всех подходах — увеличьте вес на следующей тренировке.

Записывайте каждую тренировку — так проще видеть прогресс.`,
  },
  {
    title: "Разминка перед силовой тренировкой",
    slug: "warmup-guide",
    category: "TRAINING" as const,
    content: `# Разминка

5–10 минут лёгкого кардио + 2–3 разминочных подхода первого упражнения.

## Зачем
- Подготовка суставов и мышц
- Снижение риска травм
- Лучшие рабочие веса

Не пропускайте разминочные подходы перед тяжёлыми базовыми движениями.`,
  },
];

async function main() {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: article,
      create: article,
    });
  }

  console.log(`Seeded ${exercises.length} exercises and ${articles.length} articles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
