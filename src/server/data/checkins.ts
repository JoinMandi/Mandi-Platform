/** Data access — checkins. */
import type { Db } from "@/server/db/pool";
import { all } from "@/server/db/sql";
import type { CheckinRow } from "@/lib/types/database";

export async function listCheckinsForUser(
  db: Db,
  userId: string,
): Promise<CheckinRow[]> {
  return all<CheckinRow>(
    db,
    `select * from care.checkins
     where user_id = $1
     order by completed_at desc nulls last`,
    [userId],
  );
}
