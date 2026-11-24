"use server";

import { getSessionUser } from "@/server/auth";
import { insertResponse } from "@/server/data/questionnaire";
import { withUser } from "@/server/db/withUser";
import { calculateScore } from "@/lib/domain/scoring";

/**
 * Persists a completed questionnaire. Anonymous submissions are allowed.
 *
 * The score is recomputed here from the raw answers — the client never
 * supplies the authoritative score. `responseId` is generated once per
 * attempt by the client, so a retry inserts the same row at most once.
 */
export async function submitQuestionnaire(args: {
  answers: Record<string, unknown>;
  responseId: string;
  sessionId?: string | null;
}): Promise<void> {
  const numericAnswers = Object.fromEntries(
    Object.entries(args.answers).map(([key, value]) => [Number(key), value]),
  ) as Record<number, unknown>;
  const result = calculateScore(numericAnswers);

  const user = await getSessionUser();
  await withUser(user ? { id: user.id, role: user.role } : null, (db) =>
    insertResponse(db, {
      id: args.responseId,
      session_id: args.sessionId ?? null,
      user_id: user?.id ?? null,
      language_code: null,
      answers: args.answers,
      meno_score: result.menoScore,
      score_band: result.scoreBand,
      persona: result.persona,
      self_harm_flag: result.selfHarmFlag,
      colleen_flag: result.colleenFlag,
      top_domains: result.topDomains,
    }),
  );
}
