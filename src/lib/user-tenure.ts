import type { User } from "@/lib/types";

type TenureInput = Pick<User, "registeredAt" | "status" | "inactiveSince">;

function pluralize(value: number, one: string, few: string, many: string) {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function diffYearsMonthsDays(start: Date, end: Date) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export function getTrainingTenureEnd(
  user: TenureInput,
  asOf: Date = new Date(),
): Date {
  if (user.status === "ACTIVE") {
    return asOf;
  }

  return user.inactiveSince ?? user.registeredAt;
}

export function formatTrainingTenure(
  user: TenureInput,
  asOf: Date = new Date(),
): string {
  const end = getTrainingTenureEnd(user, asOf);

  if (end.getTime() <= user.registeredAt.getTime()) {
    return "0 дн.";
  }

  const { years, months, days } = diffYearsMonthsDays(user.registeredAt, end);
  const parts: string[] = [];

  if (years > 0) {
    parts.push(
      `${years} ${pluralize(years, "год", "года", "лет")}`,
    );
  }

  if (months > 0) {
    parts.push(`${months} мес.`);
  }

  if (parts.length === 0) {
    return `${Math.max(days, 1)} ${pluralize(Math.max(days, 1), "день", "дня", "дней")}`;
  }

  return parts.join(" ");
}
