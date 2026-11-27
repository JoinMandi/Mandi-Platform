/** Data access — questionnaire_responses (parity table for Phase 0/1). */
import type { Db } from "@/server/db/pool";
import { all, count, one, run } from "@/server/db/sql";
import type { QuestionnaireResponseRow } from "@/lib/types/database";

export type QuestionnaireResponseInput = Omit<
  QuestionnaireResponseRow,
  "completed_at"
> & { completed_at?: string };

export async function insertResponse(
  db: Db,
  input: QuestionnaireResponseInput,
): Promise<void> {
  await run(
    db,
    `insert into care.questionnaire_responses
       (id, session_id, user_id, language_code, answers, meno_score, score_band,
        persona, self_harm_flag, colleen_flag, top_domains, completed_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     on conflict (id) do nothing`,
    [
      input.id,
      input.session_id,
      input.user_id,
      input.language_code,
      input.answers,
      input.meno_score,
      input.score_band,
      input.persona,
      input.self_harm_flag,
      input.colleen_flag,
      input.top_domains,
      input.completed_at ?? new Date().toISOString(),
    ],
  );
}

export async function latestResponseForUser(
  db: Db,
  userId: string,
): Promise<QuestionnaireResponseRow | null> {
  return one<QuestionnaireResponseRow>(
    db,
    `select * from care.questionnaire_responses
     where user_id = $1
     order by completed_at desc
     limit 1`,
    [userId],
  );
}

/** The most recent responses, newest first. Used by the check-in comparison. */
export async function recentResponsesForUser(
  db: Db,
  userId: string,
  limit = 2,
): Promise<QuestionnaireResponseRow[]> {
  return all<QuestionnaireResponseRow>(
    db,
    `select * from care.questionnaire_responses
     where user_id = $1
     order by completed_at desc
     limit $2`,
    [userId, limit],
  );
}

export async function countResponses(db: Db): Promise<number> {
  return count(db, `select count(*)::int as n from care.questionnaire_responses`);
}

/** User ids of every response — used to tally responses per user. */
export async function listResponseUserIds(db: Db): Promise<string[]> {
  const rows = await all<{ user_id: string | null }>(
    db,
    `select user_id from care.questionnaire_responses`,
  );
  return rows.map((r) => r.user_id).filter((id): id is string => !!id);
}
