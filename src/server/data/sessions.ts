/** Data access — sessions (POPIA consent record). */
import type { Db } from "@/server/db/pool";
import { one } from "@/server/db/sql";

/**
 * Records a POPIA consent event as a durable, timestamped session row and
 * returns its id (or null). localStorage alone is not accountable under POPIA.
 */
export async function insertConsentSession(
  db: Db,
  languageCode: string | null,
): Promise<string | null> {
  const row = await one<{ id: string }>(
    db,
    `insert into care.sessions (language_code, popia_consent, popia_consent_at)
     values ($1, true, now())
     returning id`,
    [languageCode],
  );
  return row?.id ?? null;
}
