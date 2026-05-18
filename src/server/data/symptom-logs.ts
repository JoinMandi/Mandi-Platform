/** Data access — symptom_logs. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SymptomLogRow } from "@/lib/types/database";

export async function recentLogsForUser(
  db: SupabaseClient,
  userId: string,
  sinceDate: string,
): Promise<SymptomLogRow[]> {
  const { data } = await db
    .from("symptom_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_date", sinceDate)
    .order("logged_date", { ascending: false });
  return (data ?? []) as SymptomLogRow[];
}

export async function upsertSymptomLog(
  db: SupabaseClient,
  input: { user_id: string; logged_date: string; domain: string; score: number },
): Promise<SymptomLogRow | null> {
  const { data } = await db
    .from("symptom_logs")
    .upsert(input, { onConflict: "user_id,logged_date,domain" })
    .select()
    .single();
  return (data as SymptomLogRow | null) ?? null;
}
