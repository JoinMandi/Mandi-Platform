/** Data access — roadmap_feedback. */
import type { Db } from "@/server/db/pool";
import { run } from "@/server/db/sql";
import type { FeedbackRating } from "@/lib/types/database";

export async function insertRoadmapFeedback(
  db: Db,
  input: {
    session_id: string | null;
    feels_right: FeedbackRating;
    missing_content: string | null;
  },
): Promise<void> {
  await run(
    db,
    `insert into web.roadmap_feedback (session_id, feels_right, missing_content)
     values ($1, $2, $3)`,
    [input.session_id, input.feels_right, input.missing_content],
  );
}
