/** Data access — popia_deletion_log (POPIA audit trail). */
import type { Db } from "@/server/db/pool";
import { all, run } from "@/server/db/sql";
import type { PopiaDeletionLogRow } from "@/lib/types/database";

export async function listDeletionLog(
  db: Db,
  limit = 30,
): Promise<PopiaDeletionLogRow[]> {
  return all<PopiaDeletionLogRow>(
    db,
    `select * from care.popia_deletion_log order by deleted_at desc limit $1`,
    [limit],
  );
}

export async function insertDeletionLog(
  db: Db,
  input: { user_email: string | null; deleted_by: string | null },
): Promise<void> {
  await run(
    db,
    `insert into care.popia_deletion_log (user_email, deleted_by) values ($1, $2)`,
    [input.user_email, input.deleted_by],
  );
}
