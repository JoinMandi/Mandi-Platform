/**
 * Data access — engagement & CRM queries.
 *
 * Two surfaces:
 *
 *   1. Aggregations over EXISTING tables (users, questionnaire_responses,
 *      symptom_logs, checkins) to power the admin CRM dashboard and per-user
 *      drill-down. No schema changes required.
 *
 *   2. CRUD over the NEW `engagement_events` table (added in this phase) to
 *      track UI interactions like doctor-card clicks, content-link clicks,
 *      event RSVP clicks. RLS gates select to admins.
 *
 * Per CLAUDE.md, this is the only layer allowed to call `db.from(...)`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
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
  db: SupabaseClient,
): Promise<Map<string, QuestionnaireResponseRow>> {
  const { data } = await db
    .from("questionnaire_responses")
    .select("*")
    .order("completed_at", { ascending: false });
  const out = new Map<string, QuestionnaireResponseRow>();
  for (const r of (data ?? []) as QuestionnaireResponseRow[]) {
    if (!r.user_id) continue;
    if (!out.has(r.user_id)) out.set(r.user_id, r); // ordered desc → first kept = latest
  }
  return out;
}

/** Unique user_ids that have at least one symptom log. */
export async function symptomLogUserIds(db: SupabaseClient): Promise<Set<string>> {
  const { data } = await db.from("symptom_logs").select("user_id");
  return new Set(
    ((data ?? []) as { user_id: string | null }[])
      .map((r) => r.user_id)
      .filter((id): id is string => !!id),
  );
}

/** Unique user_ids that have completed each check-in type. */
export async function checkinUserIdsByType(
  db: SupabaseClient,
): Promise<{ sixWeek: Set<string>; threeMonth: Set<string> }> {
  const { data } = await db
    .from("checkins")
    .select("user_id, type, completed_at")
    .not("completed_at", "is", null);
  const sixWeek = new Set<string>();
  const threeMonth = new Set<string>();
  for (const row of (data ?? []) as Pick<CheckinRow, "user_id" | "type" | "completed_at">[]) {
    if (!row.user_id) continue;
    if (row.type === "6week") sixWeek.add(row.user_id);
    else if (row.type === "3month") threeMonth.add(row.user_id);
  }
  return { sixWeek, threeMonth };
}

/** All check-ins for one user. */
export async function checkinsForUser(
  db: SupabaseClient,
  userId: string,
): Promise<CheckinRow[]> {
  const { data } = await db
    .from("checkins")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  return (data ?? []) as CheckinRow[];
}

/** Recent symptom logs for one user (default 30 days). */
export async function recentLogsForUser(
  db: SupabaseClient,
  userId: string,
  days: number = 30,
): Promise<SymptomLogRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data } = await db
    .from("symptom_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("logged_date", since)
    .order("logged_date", { ascending: false });
  return (data ?? []) as SymptomLogRow[];
}

/** Top N users by symptom-log count in the trailing `days` window. */
export async function topEngagedUsers(
  db: SupabaseClient,
  days: number = 7,
  limit: number = 10,
): Promise<{ userId: string; logCount: number }[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const { data } = await db
    .from("symptom_logs")
    .select("user_id")
    .gte("logged_date", since);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { user_id: string | null }[]) {
    if (!row.user_id) continue;
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  const rows: { userId: string; logCount: number }[] = [];
  counts.forEach((logCount, userId) => rows.push({ userId, logCount }));
  return rows.sort((a, b) => b.logCount - a.logCount).slice(0, limit);
}

/** Stories submitted by a user. */
export async function storiesForUser(
  db: SupabaseClient,
  userId: string,
): Promise<StoryRow[]> {
  const { data } = await db
    .from("stories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []) as StoryRow[];
}

/** One specific user. */
export async function userById(
  db: SupabaseClient,
  id: string,
): Promise<UserRow | null> {
  const { data } = await db.from("users").select("*").eq("id", id).maybeSingle();
  return (data as UserRow | null) ?? null;
}

// ── (2) engagement_events table ──────────────────────────────────

export type EngagementEventType =
  | "doctor_view"
  | "doctor_book_click"
  | "content_view"
  | "content_link_click"
  | "event_view"
  | "event_rsvp_click"
  // Funnel analytics (page impressions + questionnaire drop-off)
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
  db: SupabaseClient,
  input: EngagementEventInput,
): Promise<void> {
  try {
    await db.from("engagement_events").insert({
      event_type: input.event_type,
      user_id: input.user_id,
      session_id: input.session_id,
      target_id: input.target_id,
      meta: input.meta ?? {},
    });
  } catch {
    /* swallow — tracking must never break the UX */
  }
}

/** Count events grouped by (event_type, target_id) within the trailing window. */
export async function eventCountsByTarget(
  db: SupabaseClient,
  eventType: EngagementEventType,
  days: number = 30,
): Promise<Map<string, number>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("engagement_events")
    .select("target_id")
    .eq("event_type", eventType)
    .gte("created_at", since);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { target_id: string | null }[]) {
    const key = row.target_id ?? "(none)";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** Funnel counts for the trailing window: events and distinct sessions per type. */
export async function funnelCounts(
  db: SupabaseClient,
  days: number = 30,
): Promise<Record<string, { events: number; sessions: number }>> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("engagement_events")
    .select("event_type, target_id, session_id")
    .in("event_type", [
      "page_view",
      "questionnaire_start",
      "questionnaire_complete",
      "keep_submit",
    ])
    .gte("created_at", since);
  const out: Record<string, { events: number; sessions: number }> = {};
  const seen = new Map<string, Set<string>>();
  for (const row of (data ?? []) as {
    event_type: string;
    target_id: string | null;
    session_id: string | null;
  }[]) {
    // Exhibition scans are reported as their own funnel line.
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

/** Recent engagement events for one user (default last 20). */
export async function recentEngagementForUser(
  db: SupabaseClient,
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
  const { data } = await db
    .from("engagement_events")
    .select("id, created_at, event_type, target_id, meta")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as {
    id: number;
    created_at: string;
    event_type: EngagementEventType;
    target_id: string | null;
    meta: Record<string, unknown> | null;
  }[];
}
