/**
 * Data access — engagement & CRM queries.
 *
 * Aggregations over existing tables (users, questionnaire_responses,
 * symptom_logs, checkins) plus CRUD over engagement_events.
 */
import type { Db } from "@/server/db/pool";
import { all, one, run } from "@/server/db/sql";
import type {
  CheckinRow,
  QuestionnaireResponseRow,
  StoryRow,
  SymptomLogRow,
  UserRow,
} from "@/lib/types/database";

// ── (1) Aggregations over existing tables ────────────────────────

/** One row per user_id for the most recent questionnaire response. */
export async function latestResponsePerUser(
  db: Db,
): Promise<Map<string, QuestionnaireResponseRow>> {
  const rows = await all<QuestionnaireResponseRow>(
    db,
    `select distinct on (user_id) *
     from care.questionnaire_responses
     where user_id is not null
     order by user_id, completed_at desc`,
  );
  const out = new Map<string, QuestionnaireResponseRow>();
  for (const row of rows) {
    if (row.user_id) out.set(row.user_id, row);
  }
  return out;
}

export async function symptomLogUserIds(db: Db): Promise<Set<string>> {
  const rows = await all<{ user_id: string }>(
    db,
    `select distinct user_id from care.symptom_logs where user_id is not null`,
  );
  return new Set(rows.map((r) => r.user_id));
}

export async function checkinUserIdsByType(
  db: Db,
): Promise<{ sixWeek: Set<string>; threeMonth: Set<string> }> {
  const rows = await all<{ user_id: string; type: string }>(
    db,
    `select distinct user_id, type
     from care.checkins
     where completed_at is not null and user_id is not null`,
  );
  const sixWeek = new Set<string>();
  const threeMonth = new Set<string>();
  for (const row of rows) {
    if (row.type === "6week") sixWeek.add(row.user_id);
    else if (row.type === "3month") threeMonth.add(row.user_id);
  }
  return { sixWeek, threeMonth };
}

export async function checkinsForUser(
  db: Db,
  userId: string,
): Promise<CheckinRow[]> {
  return all<CheckinRow>(
    db,
    `select * from care.checkins where user_id = $1
     order by completed_at desc nulls last`,
    [userId],
  );
}

/** Check-in rows for a set of users (admin CRM cohort view). */
export async function checkinsForUsers(
  db: Db,
  userIds: string[],
): Promise<CheckinRow[]> {
  if (userIds.length === 0) return [];
  return all<CheckinRow>(
    db,
    `select * from care.checkins where user_id = any($1::uuid[])`,
    [userIds],
  );
}

export async function recentLogsForUser(
  db: Db,
  userId: string,
  days: number = 30,
): Promise<SymptomLogRow[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return all<SymptomLogRow>(
    db,
    `select * from care.symptom_logs
     where user_id = $1 and logged_date >= $2
     order by logged_date desc`,
    [userId, since],
  );
}

export async function topEngagedUsers(
  db: Db,
  days: number = 7,
  limit: number = 10,
): Promise<{ userId: string; logCount: number }[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const rows = await all<{ user_id: string; n: number }>(
    db,
    `select user_id, count(*)::int as n
     from care.symptom_logs
     where logged_date >= $1 and user_id is not null
     group by user_id
     order by n desc
     limit $2`,
    [since, limit],
  );
  return rows.map((r) => ({ userId: r.user_id, logCount: Number(r.n) }));
}

export async function storiesForUser(
  db: Db,
  userId: string,
): Promise<StoryRow[]> {
  return all<StoryRow>(
    db,
    `select * from web.stories where user_id = $1 order by created_at desc`,
    [userId],
  );
}

export async function userById(db: Db, id: string): Promise<UserRow | null> {
  return one<UserRow>(db, `select * from web.users where id = $1`, [id]);
}

// ── (2) engagement_events table ──────────────────────────────────

export type EngagementEventType =
  | "doctor_view"
  | "doctor_book_click"
  | "content_view"
  | "content_link_click"
  | "event_view"
  | "event_rsvp_click"
  | "page_view"
  | "questionnaire_start"
  | "questionnaire_domain"
  | "questionnaire_complete"
  | "keep_submit";

export interface EngagementEventInput {
  event_type: EngagementEventType;
  user_id: string | null;
  session_id: string | null;
  target_id: string | null;
  meta?: Record<string, unknown>;
}

/** Insert one engagement event. Best-effort: never throws to the caller. */
export async function insertEngagementEvent(
  db: Db,
  input: EngagementEventInput,
): Promise<void> {
  try {
    await run(
      db,
      `insert into web.engagement_events
         (event_type, user_id, session_id, target_id, meta)
       values ($1,$2,$3,$4,$5)`,
      [
        input.event_type,
        input.user_id,
        input.session_id,
        input.target_id,
        input.meta ?? {},
      ],
    );
  } catch {
    /* swallow — tracking must never break the UX */
  }
}

export async function eventCountsByTarget(
  db: Db,
  eventType: EngagementEventType,
  days: number = 30,
): Promise<Map<string, number>> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const rows = await all<{ target_id: string | null; n: number }>(
    db,
    `select target_id, count(*)::int as n
     from web.engagement_events
     where event_type = $1 and created_at >= $2
     group by target_id`,
    [eventType, since],
  );
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.target_id ?? "(none)", Number(row.n));
  return counts;
}

export async function funnelCounts(
  db: Db,
  days: number = 30,
): Promise<Record<string, { events: number; sessions: number }>> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const rows = await all<{
    event_type: string;
    target_id: string | null;
    session_id: string | null;
  }>(
    db,
    `select event_type, target_id, session_id
     from web.engagement_events
     where event_type = any($1::text[]) and created_at >= $2`,
    [["page_view", "questionnaire_start", "questionnaire_complete", "keep_submit"], since],
  );
  const out: Record<string, { events: number; sessions: number }> = {};
  const seen = new Map<string, Set<string>>();
  for (const row of rows) {
    const key =
      row.event_type === "page_view" && row.target_id === "/exhibition"
        ? "exhibition_view"
        : row.event_type;
    const bucket = (out[key] ??= { events: 0, sessions: 0 });
    bucket.events += 1;
    if (row.session_id) {
      const s = seen.get(key) ?? new Set<string>();
      if (!s.has(row.session_id)) {
        s.add(row.session_id);
        bucket.sessions += 1;
      }
      seen.set(key, s);
    }
  }
  return out;
}

export async function recentEngagementForUser(
  db: Db,
  userId: string,
  limit: number = 20,
): Promise<
  {
    id: number;
    created_at: string;
    event_type: EngagementEventType;
    target_id: string | null;
    meta: Record<string, unknown> | null;
  }[]
> {
  return all(
    db,
    `select id, created_at, event_type, target_id, meta
     from web.engagement_events
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  );
}
