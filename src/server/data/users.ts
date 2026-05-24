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

/** Seeds (or updates) the public.users row for a freshly signed-up account.
 *  Deliberately does NOT touch `role` — defaults to `member` server-side and
 *  the `trg_protect_user_role` trigger blocks elevation from non-admin
 *  sessions. To pre-set a role at invite time, use `upsertUserWithRole`
 *  through a service-role client instead. */
export async function seedUser(
  db: SupabaseClient,
  input: { id: string; email: string | null; language_code: string | null },
): Promise<void> {
  await db.from("users").upsert(input);
}

/** Service-role-only: upsert a public.users row INCLUDING role. Used by the
 *  admin-initiated invite flow to pre-seed the new user's role so their first
 *  /admin visit lands them on the right surface (admin / clinician dashboards
 *  vs. denied page). Trigger-friendly: the service role bypasses both RLS and
 *  `trg_protect_user_role`. Never call from a non-service client. */
export async function upsertUserWithRole(
  service: SupabaseClient,
  input: { id: string; email: string | null; role: UserRole; languageCode: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await service.from("users").upsert({
    id: input.id,
    email: input.email,
    role: input.role,
    language_code: input.languageCode,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
