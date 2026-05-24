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

/** Phase 21 — data for the /my-journey/doctor-summary print page.
 *
 *  Returns the signed-in user's email + latest questionnaire response
 *  (including the raw `answers` JSON so the page can join against
 *  `questions.ts` to render question text + her answer) + the last 30
 *  days of symptom logs aggregated per `domain` (avg score + count).
 *  Aggregation is done here (server-side) rather than the data layer
 *  so the data helpers stay reusable. */
export async function fetchDoctorSummary(): Promise<{
  email: string | null;
  latest: QuestionnaireResponseRow | null;
  symptomSummary: { domain: string; average: number; count: number }[];
} | null> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return null;
  const [latest, logs] = await Promise.all([
    latestResponseForUser(db, user.id),
    recentLogsForUser(db, user.id, isoDaysAgo(29)),
  ]);
  // Group logs by symptom, average the score.
  const byDomain = new Map<string, { sum: number; count: number }>();
  for (const log of logs) {
    if (!log.domain || log.score == null) continue;
    const slot = byDomain.get(log.domain) ?? { sum: 0, count: 0 };
    slot.sum += log.score;
    slot.count += 1;
    byDomain.set(log.domain, slot);
  }
  const symptomSummary: { domain: string; average: number; count: number }[] = [];
  byDomain.forEach((v, domain) => {
    symptomSummary.push({
      domain,
      average: Number((v.sum / v.count).toFixed(2)),
      count: v.count,
    });
  });
  symptomSummary.sort((a, b) => b.average - a.average);
  return {
    email: user.email ?? null,
    latest,
    symptomSummary,
  };
}
