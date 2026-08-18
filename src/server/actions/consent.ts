"use server";

import { createActionClient } from "@/server/supabase/server";
import { insertConsentSession } from "@/server/data/sessions";

const KNOWN_LANGS = new Set(["en", "zu", "xh", "af"]);

/**
 * Records POPIA consent server-side when the user accepts on the consent
 * screen. Returns the new session id so the client can attach it to the
 * questionnaire submission (links consent → response). Best-effort: returns
 * null rather than throwing so a DB hiccup never hard-stops the funnel.
 */
export async function recordConsent(languageCode: string | null): Promise<string | null> {
  const db = createActionClient();
  // Guard the FK to languages(code) — an unknown code would fail the insert.
  const lang = languageCode && KNOWN_LANGS.has(languageCode) ? languageCode : null;
  return insertConsentSession(db, lang);
}
