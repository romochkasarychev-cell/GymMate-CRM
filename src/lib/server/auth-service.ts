import { ApiErrors } from "@/lib/api/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/session";
import { mapUserToProfile } from "@/lib/profile-mapper";

const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw ApiErrors.badRequest(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
}

export type AuthUserResponse = {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: "USER" | "ADMIN";
};

function toAuthUser(user: {
  id: string;
  email: string;
  name: string;
  lastName: string;
  role: "USER" | "ADMIN";
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    role: user.role,
  } satisfies AuthUserResponse;
}

export async function registerUser(input: {
  email: string;
  password: string;
  name: string;
  lastName?: string;
}) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const lastName = input.lastName?.trim() ?? "";

  if (!email || !name) {
    throw ApiErrors.badRequest("Email and name are required");
  }

  validatePassword(input.password);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw ApiErrors.conflict("User with this email already exists");
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      lastName,
      passwordHash: await hashPassword(input.password),
    },
  });

  const token = await createSessionToken({ userId: user.id, email: user.email });

  return {
    user: toAuthUser(user),
    token,
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    throw ApiErrors.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    throw ApiErrors.unauthorized("Invalid email or password");
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });

  return {
    user: toAuthUser(user),
    token,
  };
}

export async function getAuthProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiErrors.notFound("User not found");
  }

  return mapUserToProfile(user);
}
