"use server";

import { createActionClient } from "@/server/supabase/server";
import { getSessionUser } from "@/server/auth";
import { latestResponseForUser } from "@/server/data/questionnaire";
import { recentLogsForUser, upsertSymptomLog } from "@/server/data/symptom-logs";
import { listCheckinsForUser } from "@/server/data/checkins";
import type {
  QuestionnaireResponseRow,
  SymptomLogRow,
  CheckinRow,
} from "@/lib/types/database";

/** ISO date (YYYY-MM-DD) for `daysAgo` days before today. */
function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/** The signed-in user's roadmap + recent symptom logs + check-ins.
 *  Returns null when there is no session. */
export async function fetchMyJourney(): Promise<{
  email: string | null;
  latest: QuestionnaireResponseRow | null;
  logs: SymptomLogRow[];
  checkins: CheckinRow[];
} | null> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return null;
  const [latest, logs, checkins] = await Promise.all([
    latestResponseForUser(db, user.id),
    recentLogsForUser(db, user.id, isoDaysAgo(6)),
    listCheckinsForUser(db, user.id),
  ]);
  return { email: user.email ?? null, latest, logs, checkins };
}

export async function logSymptom(
  loggedDate: string,
  domain: string,
  score: number,
): Promise<SymptomLogRow | null> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return null;
  return upsertSymptomLog(db, {
    user_id: user.id,
    logged_date: loggedDate,
    domain,
    score,
  });
}
