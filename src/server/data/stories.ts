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

export interface InsertStoryInput {
  content: string;
  authorName: string | null;
  languageCode: string | null;
  symptomTags: string[] | null;
  consent: boolean;
  /** Defaults to 'pending' — admin-created stories still flow through the
   *  moderation queue per the Phase-20 user decision. */
  status?: StoryStatus;
}

/** Insert a new story. Used by both anonymous public submissions (when
 *  we eventually replace the mailto flow) and admin-authored creation
 *  via /admin/stories. Returns the new row's id. */
export async function insertStory(
  db: SupabaseClient,
  input: InsertStoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data, error } = await db
    .from("stories")
    .insert({
      content: input.content,
      author_name: input.authorName,
      language_code: input.languageCode,
      symptom_tags: input.symptomTags,
      consent: input.consent,
      status: input.status ?? "pending",
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}
