import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareSupabase } from "@/server/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabase(req, res);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  const isProtected = path.startsWith("/my-journey") || path.startsWith("/admin");
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // If already logged in, keep users out of login/signup pages
  if (session && (path === "/auth/login" || path === "/auth/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/my-journey";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/my-journey/:path*", "/admin/:path*", "/auth/:path*"],
};
