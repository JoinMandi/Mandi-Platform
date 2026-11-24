"use server";

import { getSessionUser } from "@/server/auth";
import type { UserRole } from "@/lib/types/database";

/** The signed-in user's own role (safe for any client component). */
export async function fetchCurrentUserRole(): Promise<{
  role: UserRole | null;
}> {
  const user = await getSessionUser();
  return { role: user?.role ?? null };
}
