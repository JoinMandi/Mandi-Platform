"use server";

import { requireAdmin } from "@/server/auth";
import { listUsers } from "@/server/data/users";
import { listResponseUserIds } from "@/server/data/questionnaire";
import { latestResponsePerUser } from "@/server/data/engagement";
import { listDeletionLog } from "@/server/data/deletion-log";
import { withUser } from "@/server/db/withUser";
import { maskEmail } from "@/lib/domain/privacy";
import type {
  Persona,
  PopiaDeletionLogRow,
  ScoreBand,
  UserRow,
} from "@/lib/types/database";

export async function fetchUsersOverview(): Promise<{
  users: UserRow[];
  responseCounts: Record<string, number>;
  enrichment: Record<
    string,
    { persona: Persona | null; scoreBand: ScoreBand | null; lastResponseAt: string | null }
  >;
  deletionLog: PopiaDeletionLogRow[];
  isSuperadmin: boolean;
  emailsMasked: boolean;
}> {
  const actor = await requireAdmin();
  const isSuperadmin = actor.role === "superadmin";

  const data = await withUser({ id: actor.id, role: actor.role }, async (db) => ({
    rawUsers: await listUsers(db),
    responseUserIds: await listResponseUserIds(db),
    latestByUser: await latestResponsePerUser(db),
    rawDeletionLog: await listDeletionLog(db, 30),
  }));

  const responseCounts: Record<string, number> = {};
  for (const uid of data.responseUserIds) {
    responseCounts[uid] = (responseCounts[uid] ?? 0) + 1;
  }

  const enrichment: Record<
    string,
    { persona: Persona | null; scoreBand: ScoreBand | null; lastResponseAt: string | null }
  > = {};
  data.latestByUser.forEach((r, uid) => {
    enrichment[uid] = {
      persona: r.persona,
      scoreBand: r.score_band,
      lastResponseAt: r.completed_at,
    };
  });

  const users = isSuperadmin
    ? data.rawUsers
    : data.rawUsers.map((u) => ({ ...u, email: maskEmail(u.email) }));
  const deletionLog = isSuperadmin
    ? data.rawDeletionLog
    : data.rawDeletionLog.map((l) => ({ ...l, user_email: maskEmail(l.user_email) }));

  return {
    users,
    responseCounts,
    enrichment,
    deletionLog,
    isSuperadmin,
    emailsMasked: !isSuperadmin,
  };
}
