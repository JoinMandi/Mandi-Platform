"use server";

/**
 * Self-read server action — no admin/role gate.
 *
 * The signed-in user's own `public.users.role` is readable via the
 * `users_select_own` RLS policy (id = auth.uid()). Used by the public
 * NavBar to decide whether to render the "Admin" link for admin-tier
 * users. Safe to call from any client component.
 */

import { createActionClient } from "@/server/supabase/server";
import { getSessionUser } from "@/server/auth";
import { getUserRole } from "@/server/data/users";
import type { UserRole } from "@/lib/types/database";

export async function fetchCurrentUserRole(): Promise<{
  role: UserRole | null;
}> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return { role: null };
  const role = await getUserRole(db, user.id);
  return { role };
}
