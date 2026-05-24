"use server";

import { createActionClient } from "@/server/supabase/server";
import { requireAdmin, getAdminAuthStatus } from "@/server/auth";
import { listUsers } from "@/server/data/users";
import { listResponseUserIds } from "@/server/data/questionnaire";
import { latestResponsePerUser } from "@/server/data/engagement";
import { listDeletionLog } from "@/server/data/deletion-log";
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
  /** Per-user CRM enrichment (latest questionnaire signals). */
  enrichment: Record<
    string,
    { persona: Persona | null; scoreBand: ScoreBand | null; lastResponseAt: string | null }
  >;
  deletionLog: PopiaDeletionLogRow[];
  /** Phase 13: surfaced so the page can render masking hints + the right
   *  role-dropdown affordances without a second round-trip. */
  isSuperadmin: boolean;
  /** Phase 13: true if `emails` came back through `maskEmail`. */
  emailsMasked: boolean;
}> {
  const db = createActionClient();
  await requireAdmin(db);
  // Phase 13: POPIA — non-superadmin admins see masked emails on the list
  // (and the POPIA deletion log). Superadmin sees full plaintext.
  const status = await getAdminAuthStatus(db);
  const isSuperadmin = status.role === "superadmin";

  const [rawUsers, responseUserIds, latestByUser, rawDeletionLog] = await Promise.all([
    listUsers(db),
    listResponseUserIds(db),
    latestResponsePerUser(db),
    listDeletionLog(db, 30),
  ]);
  const responseCounts: Record<string, number> = {};
  for (const uid of responseUserIds) {
    responseCounts[uid] = (responseCounts[uid] ?? 0) + 1;
  }
  const enrichment: Record<
    string,
    { persona: Persona | null; scoreBand: ScoreBand | null; lastResponseAt: string | null }
  > = {};
  latestByUser.forEach((r, uid) => {
    enrichment[uid] = {
      persona: r.persona,
      scoreBand: r.score_band,
      lastResponseAt: r.completed_at,
    };
  });

  const users = isSuperadmin
    ? rawUsers
    : rawUsers.map((u) => ({ ...u, email: maskEmail(u.email) }));
  const deletionLog = isSuperadmin
    ? rawDeletionLog
    : rawDeletionLog.map((l) => ({ ...l, user_email: maskEmail(l.user_email) }));

  return {
    users,
    responseCounts,
    enrichment,
    deletionLog,
    isSuperadmin,
    emailsMasked: !isSuperadmin,
  };
}
