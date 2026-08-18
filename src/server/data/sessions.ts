/** Data access — sessions (POPIA consent record). */
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Records a POPIA consent event as a durable, timestamped session row and
 * returns its id (or null if the insert was blocked). This is the auditable
 * server-side record the consent screen must leave behind — localStorage alone
 * is not accountable under POPIA.
 */
export async function insertConsentSession(
  db: SupabaseClient,
  languageCode: string | null,
): Promise<string | null> {
  const { data } = await db
    .from("sessions")
    .insert({
      language_code: languageCode,
      popia_consent: true,
      popia_consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  return (data as { id: string } | null)?.id ?? null;
}
