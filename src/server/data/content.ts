/** Data access — content + content_translations. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentRow, ContentTranslationRow } from "@/lib/types/database";
import type { ContentWithTranslations } from "@/lib/types/models";

export type ContentCanonicalInput = Pick<
  ContentRow,
  "type" | "symptom_tags" | "persona_tags" | "published"
>;

export type ContentTranslationInput = Pick<
  ContentTranslationRow,
  "content_id" | "language_code" | "title" | "description" | "url" | "review_status"
>;

export async function listContent(db: SupabaseClient): Promise<ContentWithTranslations[]> {
  const { data } = await db
    .from("content")
    .select("*, content_translations(*)")
    .order("created_at", { ascending: false });
  return (data ?? []) as ContentWithTranslations[];
}

export async function insertContent(
  db: SupabaseClient,
  input: ContentCanonicalInput,
): Promise<string | null> {
  const { data } = await db.from("content").insert(input).select("id").single();
  return (data as { id: string } | null)?.id ?? null;
}

export async function updateContent(
  db: SupabaseClient,
  id: string,
  input: ContentCanonicalInput,
): Promise<void> {
  await db.from("content").update(input).eq("id", id);
}

export async function deleteContent(db: SupabaseClient, id: string): Promise<void> {
  await db.from("content").delete().eq("id", id);
}

export async function setContentPublished(
  db: SupabaseClient,
  id: string,
  published: boolean,
): Promise<void> {
  await db.from("content").update({ published }).eq("id", id);
}

export async function upsertContentTranslation(
  db: SupabaseClient,
  input: ContentTranslationInput,
): Promise<void> {
  await db
    .from("content_translations")
    .upsert(input, { onConflict: "content_id,language_code" });
}

export async function deleteContentTranslation(
  db: SupabaseClient,
  id: string,
): Promise<void> {
  await db.from("content_translations").delete().eq("id", id);
}
