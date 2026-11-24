"use server";

import { getSessionUser } from "@/server/auth";
import { insertResponse } from "@/server/data/questionnaire";
import { withUser } from "@/server/db/withUser";
import type { ScoreBand, Persona } from "@/lib/types/database";

/** Persists a completed questionnaire. Anonymous submissions are allowed. */
export async function submitQuestionnaire(args: {
  answers: Record<string, unknown>;
  menoScore: number;
  scoreBand: ScoreBand;
  persona: Persona;
  selfHarmFlag: boolean;
  colleenFlag: boolean;
  topDomains: string[];
  sessionId?: string | null;
}): Promise<void> {
  const user = await getSessionUser();
  await withUser(user ? { id: user.id, role: user.role } : null, (db) =>
    insertResponse(db, {
      session_id: args.sessionId ?? null,
      user_id: user?.id ?? null,
      language_code: null,
      answers: args.answers,
      meno_score: args.menoScore,
      score_band: args.scoreBand,
      persona: args.persona,
      self_harm_flag: args.selfHarmFlag,
      colleen_flag: args.colleenFlag,
      top_domains: args.topDomains,
    }),
  );
}
