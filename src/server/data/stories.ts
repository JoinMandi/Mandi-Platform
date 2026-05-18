/** Data access — stories. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoryRow, StoryStatus } from "@/lib/types/database";

export interface StoryFilters {
  status?: StoryStatus;
  languageCode?: string;
}

export async function listStories(
  db: SupabaseClient,
  filters: StoryFilters = {},
): Promise<StoryRow[]> {
  let q = db.from("stories").select("*").order("created_at", { ascending: false });
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.languageCode) q = q.eq("language_code", filters.languageCode);
  const { data } = await q;
  return (data ?? []) as StoryRow[];
}

export async function setStoryStatus(
  db: SupabaseClient,
  id: string,
  status: StoryStatus,
): Promise<void> {
  await db.from("stories").update({ status }).eq("id", id);
}

export async function countPendingStories(db: SupabaseClient): Promise<number> {
  const { count } = await db
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
