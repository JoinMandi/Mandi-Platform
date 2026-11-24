"use server";

import { getSessionUser } from "@/server/auth";
import { insertConsentSession } from "@/server/data/sessions";
import { withUser } from "@/server/db/withUser";

const KNOWN_LANGS = new Set(["en", "zu", "xh", "af"]);

/**
 * Records POPIA consent server-side when she accepts on the consent screen.
 * Returns the new session id, or null on a database hiccup.
 */
export async function recordConsent(languageCode: string | null): Promise<string | null> {
  const lang = languageCode && KNOWN_LANGS.has(languageCode) ? languageCode : null;
  const user = await getSessionUser();
  try {
    return await withUser(
      user ? { id: user.id, role: user.role } : null,
      (db) => insertConsentSession(db, lang),
    );
  } catch {
    return null;
  }
}
