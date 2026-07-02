import { cookies } from "next/headers";
import { ApiErrors } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");

    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return null;
}

export async function getSessionUser(request: Request) {
  const token = getSessionToken(request);

  if (!token) {
    return null;
  }

  try {
    const session = await verifySessionToken(token);
    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireSessionUser(request: Request) {
  const user = await getSessionUser(request);

  if (!user) {
    throw ApiErrors.unauthorized("Authentication required");
  }

  return user;
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await verifySessionToken(token);
    const user = await prisma.user.findUnique({ where: { id: session.userId } });

    if (!user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function requireSessionUserFromCookies() {
  const user = await getSessionUserFromCookies();

  if (!user) {
    throw ApiErrors.unauthorized("Authentication required");
  }

  return user;
}

export async function requireAdminUser(request: Request) {
  const user = await requireSessionUser(request);

  if (user.role !== "ADMIN") {
    throw ApiErrors.forbidden("Admin access required");
  }

  return user;
}

export async function requireAdminUserFromCookies() {
  const user = await requireSessionUserFromCookies();

  if (user.role !== "ADMIN") {
    throw ApiErrors.forbidden("Admin access required");
  }

  return user;
}
