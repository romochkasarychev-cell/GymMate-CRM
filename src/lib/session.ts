import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "gymmate_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  email: string;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET must be set to a random string of at least 16 characters",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export const createSession = createSessionToken;

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret());

  if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
    throw new Error("Invalid session payload");
  }

  return {
    userId: payload.userId,
    email: payload.email,
  } satisfies SessionPayload;
}
