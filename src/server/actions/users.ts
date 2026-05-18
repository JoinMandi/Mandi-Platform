"use server";

import { createActionClient } from "@/server/supabase/server";
import { requireAdmin } from "@/server/auth";
import { listUsers } from "@/server/data/users";
import { listResponseUserIds } from "@/server/data/questionnaire";
import { listDeletionLog } from "@/server/data/deletion-log";
import type { UserRow, PopiaDeletionLogRow } from "@/lib/types/database";

export async function fetchUsersOverview(): Promise<{
  users: UserRow[];
  responseCounts: Record<string, number>;
  deletionLog: PopiaDeletionLogRow[];
}> {
  const db = createActionClient();
  await requireAdmin(db);
  const [users, responseUserIds, deletionLog] = await Promise.all([
    listUsers(db),
    listResponseUserIds(db),
    listDeletionLog(db, 30),
  ]);
  const responseCounts: Record<string, number> = {};
  for (const uid of responseUserIds) {
    responseCounts[uid] = (responseCounts[uid] ?? 0) + 1;
  }
  return { users, responseCounts, deletionLog };
}
