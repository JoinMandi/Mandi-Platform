/** Data access — languages lookup table. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { LanguageRow } from "@/lib/types/database";

export async function listEnabledLanguages(
  db: SupabaseClient,
): Promise<LanguageRow[]> {
  const { data } = await db
    .from("languages")
    .select("*")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as LanguageRow[];
}
