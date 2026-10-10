import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The proxy only provides an early navigation redirect. API handlers must
  // always resolve the Better Auth session and authorize the operation.
  if (
    pathname === "/" ||
    pathname === "/sign-in" ||
    pathname === "/check-in" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/tracking")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
