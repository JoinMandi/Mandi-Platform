/** Data access — exhibition_signups (festival + roadmap contact capture). */
import type { Db } from "@/server/db/pool";
import { run } from "@/server/db/sql";
import type { AgeBand, ScoreBand } from "@/lib/types/database";

export type SignupSource =
  | "exhibition"
  | "roadmap"
  | "booking"
  | "doctor-application";

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

/**
 * Inserts a signup. No RETURNING clause: the table's SELECT policy is
 * admin-only, so asking for the row back would make the insert fail for an
 * anonymous visitor.
 */
export async function insertExhibitionSignup(
  db: Db,
  input: ExhibitionSignupInput,
): Promise<boolean> {
  const affected = await run(
    db,
    `insert into web.exhibition_signups
       (email, whatsapp, age_band, language_code, meno_score, score_band,
        answers, consent, marketing_opt_in, source)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      input.email,
      input.whatsapp,
      input.age_band,
      input.language_code,
      input.meno_score,
      input.score_band,
      input.answers,
      input.consent,
      input.marketing_opt_in,
      input.source,
    ],
  );
  return affected > 0;
}

/** POPIA erasure: signups have no FK to users, so delete by email (service). */
export async function deleteExhibitionSignupsByEmail(
  db: Db,
  email: string,
): Promise<void> {
  await run(db, `delete from web.exhibition_signups where lower(email) = lower($1)`, [
    email,
  ]);
}
