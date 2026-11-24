"use server";

/** Application layer — CRM dashboard data for the admin surface. */
import { requireAdmin } from "@/server/auth";
import { insertAuditLog } from "@/server/data/audit";
import { maskEmail } from "@/lib/domain/privacy";
import { listUsers } from "@/server/data/users";
import {
  checkinUserIdsByType,
  checkinsForUser,
  checkinsForUsers,
  eventCountsByTarget,
  funnelCounts,
  latestResponsePerUser,
  recentEngagementForUser,
  recentLogsForUser,
  storiesForUser,
  symptomLogUserIds,
  userById,
} from "@/server/data/engagement";
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
import { withService, withUser } from "@/server/db/withUser";

export interface CrmOverview {
  funnel: FunnelCounts;
  byPersona: Record<Persona, number>;
  byBand: Record<ScoreBand, number>;
  byLanguage: Record<string, number>;
  compliance: ComplianceCohort;
  topByEvent: Partial<
    Record<EngagementEventType, { targetId: string; count: number }[]>
  >;
  funnelEvents: Record<string, { events: number; sessions: number }>;
}

/** Powers the main `/admin` CRM dashboard. */
export async function fetchCrmOverview(): Promise<CrmOverview> {
  const actor = await requireAdmin();

  return withUser({ id: actor.id, role: actor.role }, async (db) => {
    const users = await listUsers(db);
    const latestByUser = await latestResponsePerUser(db);
    const logUserIds = await symptomLogUserIds(db);
    const checkinIds = await checkinUserIdsByType(db);

    const responseUserIds = new Set<string>();
    latestByUser.forEach((_v, k) => responseUserIds.add(k));

    const funnel = funnelStats(users, responseUserIds, logUserIds, checkinIds.sixWeek);
    const byPersona = segmentByPersona(latestByUser);
    const byBand = segmentByBand(latestByUser);
    const byLanguage = segmentByLanguage(users);

    const userIdsWithResponses: string[] = [];
    responseUserIds.forEach((id) => userIdsWithResponses.push(id));
    const checkinRowsByUser = new Map<string, CheckinRow[]>();
    if (userIdsWithResponses.length > 0) {
      const rows = await checkinsForUsers(db, userIdsWithResponses);
      for (const row of rows) {
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

    const topByEvent: Partial<
      Record<EngagementEventType, { targetId: string; count: number }[]>
    > = {};
    for (const eventType of [
      "doctor_book_click",
      "content_link_click",
      "event_rsvp_click",
    ] as const) {
      const counts = await eventCountsByTarget(db, eventType, 30);
      const arr: { targetId: string; count: number }[] = [];
      counts.forEach((count, targetId) => arr.push({ targetId, count }));
      topByEvent[eventType] = arr.sort((a, b) => b.count - a.count).slice(0, 10);
    }

    const funnelEvents = await funnelCounts(db, 30);

    return { funnel, byPersona, byBand, byLanguage, compliance, topByEvent, funnelEvents };
  });
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

/** Powers `/admin/users/[id]`. Every view is audited. */
export async function fetchUserTimeline(userId: string): Promise<UserTimeline> {
  const actor = await requireAdmin();
  const isSuperadmin = actor.role === "superadmin";

  const data = await withUser({ id: actor.id, role: actor.role }, async (db) => {
    const user = await userById(db, userId);
    const latestMap = await latestResponsePerUser(db);
    const checkins = await checkinsForUser(db, userId);
    const logs = await recentLogsForUser(db, userId, 30);
    const stories = await storiesForUser(db, userId);
    const events = await recentEngagementForUser(db, userId, 20);
    return { user, latest: latestMap.get(userId) ?? null, checkins, logs, stories, events };
  });

  await withService((db) =>
    insertAuditLog(db, {
      action: "user_view",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: userId,
      meta: { isSuperadmin },
    }),
  );

  const safeUser =
    data.user && !isSuperadmin
      ? { ...data.user, email: maskEmail(data.user.email) }
      : data.user;

  return { ...data, user: safeUser };
}
