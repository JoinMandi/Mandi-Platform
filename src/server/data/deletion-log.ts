/** Data access — popia_deletion_log (POPIA audit trail). */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PopiaDeletionLogRow } from "@/lib/types/database";

export async function listDeletionLog(
  db: SupabaseClient,
  limit = 30,
): Promise<PopiaDeletionLogRow[]> {
  const { data } = await db
    .from("popia_deletion_log")
    .select("*")
    .order("deleted_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as PopiaDeletionLogRow[];
}

export async function insertDeletionLog(
  db: SupabaseClient,
  input: { user_email: string | null; deleted_by: string | null },
): Promise<void> {
  await db.from("popia_deletion_log").insert(input);
}
