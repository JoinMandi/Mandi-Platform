import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Supabase client for Client Components — carries the signed-in user's session,
 * so RLS applies as that user. Use only inside `"use client"` components.
 */
export function createBrowserClient() {
  return createClientComponentClient();
}
