import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Supabase client for Next.js middleware — refreshes the auth session on the
 * passed request/response pair.
 */
export function createMiddlewareSupabase(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient({ req, res });
}
