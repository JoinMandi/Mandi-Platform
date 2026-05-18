/** Data access — roadmap_feedback. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackRating } from "@/lib/types/database";

export async function insertRoadmapFeedback(
  db: SupabaseClient,
  input: {
    session_id: string | null;
    feels_right: FeedbackRating;
    missing_content: string | null;
  },
): Promise<void> {
  await db.from("roadmap_feedback").insert(input);
}
