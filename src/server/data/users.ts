/** Data access — users. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole, UserRow } from "@/lib/types/database";

export async function getUserRole(
  db: SupabaseClient,
  userId: string,
): Promise<UserRole | null> {
  const { data } = await db
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return (data?.role as UserRole | undefined) ?? null;
}

export async function getUserAccount(
  db: SupabaseClient,
  userId: string,
): Promise<{ role: UserRole; email: string | null } | null> {
  const { data } = await db
    .from("users")
    .select("role, email")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    role: data.role as UserRole,
    email: (data.email as string | null) ?? null,
  };
}

export async function listUsers(db: SupabaseClient): Promise<UserRow[]> {
  const { data } = await db
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as UserRow[];
}

export async function countUsers(db: SupabaseClient): Promise<number> {
  const { count } = await db
    .from("users")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

/** Seeds (or updates) the public.users row for a freshly signed-up account. */
export async function seedUser(
  db: SupabaseClient,
  input: { id: string; email: string | null; language_code: string | null },
): Promise<void> {
  await db.from("users").upsert(input);
}
