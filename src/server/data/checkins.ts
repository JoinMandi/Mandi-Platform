/** Data access — checkins. */
import type { Db } from "@/server/db/pool";
import { all, one } from "@/server/db/sql";
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

export async function insertCheckin(
  db: Db,
  input: {
    user_id: string;
    type: "6week" | "3month" | "4month";
    action_taken?: string | null;
    open_response?: string | null;
  },
): Promise<CheckinRow | null> {
  return one<CheckinRow>(
    db,
    `insert into care.checkins (user_id, type, action_taken, open_response, completed_at)
     values ($1,$2,$3,$4, now())
     returning *`,
    [input.user_id, input.type, input.action_taken ?? null, input.open_response ?? null],
  );
}
