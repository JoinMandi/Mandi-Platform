import { cookies } from "next/headers";
import {
  createServerComponentClient,
  createServerActionClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";

/**
 * Supabase client for Server Components (read-only cookie access). RLS applies
 * as the signed-in user.
 */
export function createServerClient() {
  return createServerComponentClient({ cookies });
}

/**
 * Supabase client for Server Actions — may refresh/write auth cookies. RLS
 * applies as the signed-in user.
 */
export function createActionClient() {
  return createServerActionClient({ cookies });
}

/**
 * Supabase client for Route Handlers (`src/app/api/**`). RLS applies as the
 * signed-in user.
 */
export function createRouteClient() {
  return createRouteHandlerClient({ cookies });
}
