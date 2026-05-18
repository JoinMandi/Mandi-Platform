/** Data access — checkins. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CheckinRow } from "@/lib/types/database";

export async function listCheckinsForUser(
  db: SupabaseClient,
  userId: string,
): Promise<CheckinRow[]> {
  const { data } = await db
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  return (data ?? []) as CheckinRow[];
}
