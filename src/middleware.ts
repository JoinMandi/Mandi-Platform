import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "mandi_session";

/**
 * Coarse gate only: checks that a sealed session cookie exists and preserves
 * `?next=`. Real role, MFA and ownership checks happen in the server guards
 * and in RLS.
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Request log for the app container's CloudWatch stream. Path only, never
  // the query string, because questionnaire URLs can carry answers.
  if (path.startsWith("/api/")) {
    console.log(`${req.method} ${path}`);
  }

  const signedIn = req.cookies.has(SESSION_COOKIE);

  const isProtected =
    path.startsWith("/my-journey") || path.startsWith("/admin");

  if (isProtected && !signedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (signedIn && (path === "/auth/login" || path === "/auth/signup")) {
    const url = req.nextUrl.clone();
    const next = req.nextUrl.searchParams.get("next");
    url.pathname =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/my-journey";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/my-journey/:path*", "/admin/:path*", "/auth/:path*", "/api/:path*"],
};
