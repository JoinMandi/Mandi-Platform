/** Application-layer auth/role guards. Used by Server Actions and Route Handlers. */
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getUserRole } from "@/server/data/users";

/** The signed-in user for this request, or null. */
export async function getSessionUser(db: SupabaseClient): Promise<User | null> {
  const {
    data: { session },
  } = await db.auth.getSession();
  return session?.user ?? null;
}

/** Asserts the caller is a signed-in admin; throws otherwise. Returns the user. */
export async function requireAdmin(db: SupabaseClient): Promise<User> {
  const user = await getSessionUser(db);
  if (!user) throw new Error("Not authenticated");
  const role = await getUserRole(db, user.id);
  if (role !== "admin") throw new Error("Admin access required");
  return user;
}
