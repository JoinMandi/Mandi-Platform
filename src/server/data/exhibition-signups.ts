/** Data access — exhibition_signups (festival + roadmap contact capture). */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgeBand, ScoreBand } from "@/lib/types/database";

export type SignupSource = "exhibition" | "roadmap";

export interface ExhibitionSignupInput {
  email: string;
  whatsapp: string | null;
  age_band: AgeBand | null;
  language_code: string | null;
  meno_score: number | null;
  score_band: ScoreBand | null;
  answers: Record<string, unknown> | null;
  consent: boolean;
  marketing_opt_in: boolean;
  source: SignupSource;
}

/** Inserts a signup and returns its id (or null if blocked). */
export async function insertExhibitionSignup(
  db: SupabaseClient,
  input: ExhibitionSignupInput,
): Promise<string | null> {
  const { data } = await db
    .from("exhibition_signups")
    .insert(input)
    .select("id")
    .single();
  return (data as { id: string } | null)?.id ?? null;
}

/** POPIA erasure: signups have no FK to auth.users, so delete by email (service role). */
export async function deleteExhibitionSignupsByEmail(
  db: SupabaseClient,
  email: string,
): Promise<void> {
  await db.from("exhibition_signups").delete().eq("email", email);
}
