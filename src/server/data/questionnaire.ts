/** Data access — questionnaire_responses. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionnaireResponseRow } from "@/lib/types/database";

export type QuestionnaireResponseInput = Omit<
  QuestionnaireResponseRow,
  "id" | "completed_at"
> & { completed_at?: string };

export async function insertResponse(
  db: SupabaseClient,
  input: QuestionnaireResponseInput,
): Promise<void> {
  await db.from("questionnaire_responses").insert(input);
}

export async function latestResponseForUser(
  db: SupabaseClient,
  userId: string,
): Promise<QuestionnaireResponseRow | null> {
  const { data } = await db
    .from("questionnaire_responses")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(1);
  return ((data ?? [])[0] as QuestionnaireResponseRow | undefined) ?? null;
}

export async function countResponses(db: SupabaseClient): Promise<number> {
  const { count } = await db
    .from("questionnaire_responses")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

/** Returns the user_id of every response — used to tally responses per user. */
export async function listResponseUserIds(db: SupabaseClient): Promise<string[]> {
  const { data } = await db.from("questionnaire_responses").select("user_id");
  return (data ?? [])
    .map((r) => (r as { user_id: string | null }).user_id)
    .filter((id): id is string => !!id);
}
