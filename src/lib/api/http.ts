import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { logger } from "@/lib/logger";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonResponseWithSession<T>(data: T, token: string, status = 200) {
  const response = NextResponse.json(data, { status });
  setSessionCookie(response, token);
  return response;
}

export function clearSessionResponse() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    const level = error.status >= 500 ? "error" : "warn";
    void logger[level]("api.error", {
      code: error.code,
      message: error.message,
      status: error.status,
    });

    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.status },
    );
  }

  void logger.error("api.error.internal", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    { error: "INTERNAL_ERROR", message: "Internal server error" },
    { status: 500 },
  );
}
