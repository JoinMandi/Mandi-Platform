"use server";

/**
 * Application layer — CRM dashboard data for the admin surface.
 * All actions enforce `requireAdmin`.
 */
import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { requireAdmin, getAdminAuthStatus } from "@/server/auth";
import { insertAuditLog } from "@/server/data/audit";
import { maskEmail } from "@/lib/domain/privacy";
import { listUsers } from "@/server/data/users";
import {
  checkinUserIdsByType,
  checkinsForUser,
  eventCountsByTarget,
  latestResponsePerUser,
  recentEngagementForUser,
  recentLogsForUser,
  storiesForUser,
  symptomLogUserIds,
  userById,
} from "@/server/data/engagement";
// Phase 20: `topEngagedUsers` import dropped from this file — the
// dashboard's per-user "Most engaged this week" card was a POPIA
// concern and is gone. The data helper itself stays exported from
// `@/server/data/engagement` for potential reuse on the per-user
// drill-down.
import {
  aggregateCompliance,
  funnelStats,
  segmentByBand,
  segmentByLanguage,
  segmentByPersona,
  type ComplianceCohort,
  type FunnelCounts,
} from "@/lib/domain/crm";
import type {
  CheckinRow,
  Persona,
  QuestionnaireResponseRow,
  ScoreBand,
  StoryRow,
  SymptomLogRow,
  UserRow,
} from "@/lib/types/database";
import type { EngagementEventType } from "@/server/data/engagement";

export interface CrmOverview {
  funnel: FunnelCounts;
  byPersona: Record<Persona, number>;
  byBand: Record<ScoreBand, number>;
  byLanguage: Record<string, number>;
  compliance: ComplianceCohort;
  /** Optional Half B sections — only populated if engagement_events exists. */
  topByEvent: Partial<
    Record<EngagementEventType, { targetId: string; count: number }[]>
  >;
}

/** Powers the main `/admin` CRM dashboard. */
export async function fetchCrmOverview(): Promise<CrmOverview> {
  const db = createActionClient();
  await requireAdmin(db);

  const [users, latestByUser, logUserIds, checkinIds] = await Promise.all([
    listUsers(db),
    latestResponsePerUser(db),
    symptomLogUserIds(db),
    checkinUserIdsByType(db),
  ]);

  const responseUserIds = new Set<string>();
  latestByUser.forEach((_v, k) => responseUserIds.add(k));

  const funnel = funnelStats(
    users,
    responseUserIds,
    logUserIds,
    checkinIds.sixWeek,
  );
  const byPersona = segmentByPersona(latestByUser);
  const byBand = segmentByBand(latestByUser);
  const byLanguage = segmentByLanguage(users);

  // Cohort compliance — need per-user check-in rows for each user with a response
  const userIdsWithResponses: string[] = [];
  responseUserIds.forEach((id) => userIdsWithResponses.push(id));
  const checkinRowsByUser = new Map<string, CheckinRow[]>();
  if (userIdsWithResponses.length > 0) {
    const { data } = await db
      .from("checkins")
      .select("*")
      .in("user_id", userIdsWithResponses);
    for (const row of (data ?? []) as CheckinRow[]) {
      if (!row.user_id) continue;
      const arr = checkinRowsByUser.get(row.user_id) ?? [];
      arr.push(row);
      checkinRowsByUser.set(row.user_id, arr);
    }
  }
  const compliance = aggregateCompliance(
    userIdsWithResponses.map((id) => ({
      latest: latestByUser.get(id) ?? null,
      checkins: checkinRowsByUser.get(id) ?? [],
    })),
  );

  // Half B — engagement_events. If the table doesn't exist yet (no migration
  // applied), each call returns empty; the dashboard renders a friendly
  // empty state.
  const topByEvent: Partial<
    Record<EngagementEventType, { targetId: string; count: number }[]>
  > = {};
  await Promise.all(
    (["doctor_book_click", "content_link_click", "event_rsvp_click"] as const).map(
      async (eventType) => {
        try {
          const counts = await eventCountsByTarget(db, eventType, 30);
          const arr: { targetId: string; count: number }[] = [];
          counts.forEach((count, targetId) => arr.push({ targetId, count }));
          topByEvent[eventType] = arr.sort((a, b) => b.count - a.count).slice(0, 10);
        } catch {
          /* table may not exist yet — leave undefined */
        }
      },
    ),
  );

  return {
    funnel,
    byPersona,
    byBand,
    byLanguage,
    compliance,
    topByEvent,
  };
}

export interface UserTimeline {
  user: UserRow | null;
  latest: QuestionnaireResponseRow | null;
  checkins: CheckinRow[];
  logs: SymptomLogRow[];
  stories: StoryRow[];
  events: {
    id: number;
    created_at: string;
    event_type: EngagementEventType;
    target_id: string | null;
    meta: Record<string, unknown> | null;
  }[];
}

/** Powers `/admin/users/[id]`.
 *
 *  Phase 13: every view is audited (POPIA paper trail — admins can read,
 *  but each read is logged). Email is masked for non-superadmin admins;
 *  superadmin sees full email plaintext.
 */
export async function fetchUserTimeline(userId: string): Promise<UserTimeline> {
  const db = createActionClient();
  const actor = await requireAdmin(db);
  const status = await getAdminAuthStatus(db);
  const isSuperadmin = status.role === "superadmin";

  const [user, latestMap, checkins, logs, stories, events] = await Promise.all([
    userById(db, userId),
    latestResponsePerUser(db),
    checkinsForUser(db, userId),
    recentLogsForUser(db, userId, 30),
    storiesForUser(db, userId),
    recentEngagementForUser(db, userId, 20).catch(() => []), // table may not exist yet
  ]);

  // POPIA audit: who looked at whose profile, and when. Service-role
  // insert (the only client allowed to write to admin_audit_log).
  await insertAuditLog(createServiceClient(), {
    action: "user_view",
    actorId: actor.id,
    actorEmail: actor.email ?? null,
    targetId: userId,
    meta: { isSuperadmin },
  });

  const safeUser = user && !isSuperadmin
    ? { ...user, email: maskEmail(user.email) }
    : user;

  return {
    user: safeUser,
    latest: latestMap.get(userId) ?? null,
    checkins,
    logs,
    stories,
    events,
  };
}
