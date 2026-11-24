"use server";

import { getSessionUser } from "@/server/auth";
import { latestResponseForUser } from "@/server/data/questionnaire";
import { recentLogsForUser, upsertSymptomLog } from "@/server/data/symptom-logs";
import { listCheckinsForUser } from "@/server/data/checkins";
import { withUser } from "@/server/db/withUser";
import type {
  QuestionnaireResponseRow,
  SymptomLogRow,
  CheckinRow,
} from "@/lib/types/database";

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export async function fetchMyJourney(): Promise<{
  email: string | null;
  latest: QuestionnaireResponseRow | null;
  logs: SymptomLogRow[];
  checkins: CheckinRow[];
} | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return withUser({ id: user.id, role: user.role }, async (db) => {
    const latest = await latestResponseForUser(db, user.id);
    const logs = await recentLogsForUser(db, user.id, isoDaysAgo(6));
    const checkins = await listCheckinsForUser(db, user.id);
    return { email: user.email, latest, logs, checkins };
  });
}

export async function logSymptom(
  loggedDate: string,
  domain: string,
  score: number,
): Promise<SymptomLogRow | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return withUser({ id: user.id, role: user.role }, (db) =>
    upsertSymptomLog(db, {
      user_id: user.id,
      logged_date: loggedDate,
      domain,
      score,
    }),
  );
}

export async function fetchDoctorSummary(): Promise<{
  email: string | null;
  latest: QuestionnaireResponseRow | null;
  symptomSummary: { domain: string; average: number; count: number }[];
} | null> {
  const user = await getSessionUser();
  if (!user) return null;

  return withUser({ id: user.id, role: user.role }, async (db) => {
    const latest = await latestResponseForUser(db, user.id);
    const logs = await recentLogsForUser(db, user.id, isoDaysAgo(29));

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
    return { email: user.email, latest, symptomSummary };
  });
}
