/**
 * Domain — CRM segmentation + engagement helpers.
 *
 * Pure functions, no I/O. Consumed by the admin CRM dashboard and the per-user
 * drill-down. All inputs are database row types from `src/lib/types/database.ts`
 * — never re-define row shapes here.
 */
import type {
  CheckinRow,
  Persona,
  QuestionnaireResponseRow,
  ScoreBand,
  SymptomLogRow,
  UserRow,
} from "@/lib/types/database";

export const PERSONAS: Persona[] = [
  "sally", "olga", "vicky", "nelly", "nina", "retha", "colleen",
];

export const SCORE_BANDS: ScoreBand[] = ["mild", "moderate", "significant"];

export const LANGUAGE_CODES = ["en", "zu", "xh", "af"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];

// ── Segments ─────────────────────────────────────────────────────

/** Tally users into persona buckets, using their LATEST questionnaire only.
 *  A user with no questionnaire is excluded from persona counts. */
export function segmentByPersona(
  latestByUser: Map<string, QuestionnaireResponseRow | null>,
): Record<Persona, number> {
  const out: Record<Persona, number> = {
    sally: 0, olga: 0, vicky: 0, nelly: 0, nina: 0, retha: 0, colleen: 0,
  };
  latestByUser.forEach((resp) => {
    if (resp?.persona) out[resp.persona] += 1;
  });
  return out;
}

/** Tally users into score-band buckets (latest questionnaire). */
export function segmentByBand(
  latestByUser: Map<string, QuestionnaireResponseRow | null>,
): Record<ScoreBand, number> {
  const out: Record<ScoreBand, number> = { mild: 0, moderate: 0, significant: 0 };
  latestByUser.forEach((resp) => {
    if (resp?.score_band) out[resp.score_band] += 1;
  });
  return out;
}

/** Tally users by their stored UI language preference. */
export function segmentByLanguage(users: UserRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const u of users) {
    const code = (u.language_code ?? "en").toLowerCase();
    out[code] = (out[code] ?? 0) + 1;
  }
  return out;
}

// ── Compliance ───────────────────────────────────────────────────

export interface ComplianceStatus {
  /** Has the 6-week check-in been completed? */
  sixWeekDone: boolean;
  /** Has the 3-month check-in been completed? */
  threeMonthDone: boolean;
  /** Have they passed the 6-week mark since their latest questionnaire? */
  sixWeekDue: boolean;
  /** Have they passed the 3-month mark since their latest questionnaire? */
  threeMonthDue: boolean;
}

/** Per-user compliance: are they due for a check-in, and have they done it? */
export function complianceStatus(
  latest: QuestionnaireResponseRow | null,
  checkins: CheckinRow[],
  now: Date = new Date(),
): ComplianceStatus {
  if (!latest) {
    return {
      sixWeekDone: false,
      threeMonthDone: false,
      sixWeekDue: false,
      threeMonthDue: false,
    };
  }
  const startMs = new Date(latest.completed_at).getTime();
  const weeksSince = (now.getTime() - startMs) / (1000 * 60 * 60 * 24 * 7);
  const sixWeekDone = checkins.some(
    (c) => c.type === "6week" && c.completed_at !== null,
  );
  const threeMonthDone = checkins.some(
    (c) => c.type === "3month" && c.completed_at !== null,
  );
  return {
    sixWeekDone,
    threeMonthDone,
    sixWeekDue: weeksSince >= 6,
    threeMonthDue: weeksSince >= 12,
  };
}

/** Cohort compliance — % of users past the milestone who completed it. */
export interface ComplianceCohort {
  sixWeekDue: number;
  sixWeekDone: number;
  sixWeekRate: number;
  threeMonthDue: number;
  threeMonthDone: number;
  threeMonthRate: number;
}

export function aggregateCompliance(
  rows: { latest: QuestionnaireResponseRow | null; checkins: CheckinRow[] }[],
  now: Date = new Date(),
): ComplianceCohort {
  let sixWeekDue = 0,
    sixWeekDone = 0,
    threeMonthDue = 0,
    threeMonthDone = 0;
  for (const r of rows) {
    const s = complianceStatus(r.latest, r.checkins, now);
    if (s.sixWeekDue) sixWeekDue += 1;
    if (s.sixWeekDue && s.sixWeekDone) sixWeekDone += 1;
    if (s.threeMonthDue) threeMonthDue += 1;
    if (s.threeMonthDue && s.threeMonthDone) threeMonthDone += 1;
  }
  return {
    sixWeekDue,
    sixWeekDone,
    sixWeekRate: sixWeekDue > 0 ? sixWeekDone / sixWeekDue : 0,
    threeMonthDue,
    threeMonthDone,
    threeMonthRate: threeMonthDue > 0 ? threeMonthDone / threeMonthDue : 0,
  };
}

// ── Engagement level (symptom-log-based) ─────────────────────────

export type EngagementLevel = "inactive" | "light" | "active" | "engaged";

/** Classify a user's recent engagement by how many symptom logs they have
 *  in the past `sinceDays` window. Generous thresholds: a Mandi user logging
 *  even a handful of entries is meaningfully engaged. */
export function engagementLevel(
  logs: SymptomLogRow[],
  sinceDays: number = 7,
  now: Date = new Date(),
): EngagementLevel {
  const cutoff = now.getTime() - sinceDays * 24 * 60 * 60 * 1000;
  const recent = logs.filter((l) => {
    const d = l.logged_date ? new Date(l.logged_date).getTime() : 0;
    return d >= cutoff;
  }).length;
  if (recent === 0) return "inactive";
  if (recent <= 3) return "light";
  if (recent <= 10) return "active";
  return "engaged";
}

/** Funnel from signups → questionnaire → symptom-tracking → 6-week check-in. */
export interface FunnelCounts {
  signedUp: number;
  answeredQuestionnaire: number;
  trackedSymptoms: number;
  completedSixWeek: number;
}

export function funnelStats(
  users: UserRow[],
  responseUserIds: Set<string>,
  logUserIds: Set<string>,
  sixWeekUserIds: Set<string>,
): FunnelCounts {
  const userIds = new Set(users.map((u) => u.id));
  const countIn = (s: Set<string>) => {
    let n = 0;
    s.forEach((id) => { if (userIds.has(id)) n += 1; });
    return n;
  };
  return {
    signedUp: users.length,
    answeredQuestionnaire: countIn(responseUserIds),
    trackedSymptoms: countIn(logUserIds),
    completedSixWeek: countIn(sixWeekUserIds),
  };
}
