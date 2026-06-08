import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const PUBLIC_PAGE_PATHS = ["/login", "/register", "/api-docs"];
const PUBLIC_API_PATHS = ["/api/auth/login", "/api/auth/register", "/api/openapi"];

function isPublicPage(pathname: string) {
  return PUBLIC_PAGE_PATHS.includes(pathname);
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PATHS.includes(pathname);
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    await verifySessionToken(token);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const useApi = process.env.NEXT_PUBLIC_USE_API === "true";
  const authenticated = await hasValidSession(request);

  if (isPublicPage(pathname)) {
    if (authenticated && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.next();
  }

  if (useApi && !authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
