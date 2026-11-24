/** Data access — symptom_logs. */
import type { Db } from "@/server/db/pool";
import { all, one } from "@/server/db/sql";
import type { SymptomLogRow } from "@/lib/types/database";

export async function recentLogsForUser(
  db: Db,
  userId: string,
  sinceDate: string,
): Promise<SymptomLogRow[]> {
  return all<SymptomLogRow>(
    db,
    `select * from care.symptom_logs
     where user_id = $1 and logged_date >= $2
     order by logged_date desc`,
    [userId, sinceDate],
  );
}

export async function upsertSymptomLog(
  db: Db,
  input: { user_id: string; logged_date: string; domain: string; score: number },
): Promise<SymptomLogRow | null> {
  return one<SymptomLogRow>(
    db,
    `insert into care.symptom_logs (user_id, logged_date, domain, score)
     values ($1,$2,$3,$4)
     on conflict (user_id, logged_date, domain)
     do update set score = excluded.score
     returning *`,
    [input.user_id, input.logged_date, input.domain, input.score],
  );
}
