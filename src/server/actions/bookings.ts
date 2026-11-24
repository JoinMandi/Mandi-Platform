"use server";

import { insertExhibitionSignup } from "@/server/data/exhibition-signups";
import { withAnon } from "@/server/db/withUser";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LANGS = new Set(["en", "zu", "xh", "af"]);

/**
 * Booking lead. The WhatsApp handoff is a placeholder until the Mandi number
 * is issued; the lead is stored so nothing is lost in the meantime.
 */
export async function submitBookingLead(args: {
  name: string;
  email: string;
  whatsapp?: string;
  languageCode?: string;
  concern?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = args.name.trim();
  const email = args.email.trim().toLowerCase();
  if (!name || name.length > 120) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const whatsapp = (args.whatsapp ?? "").trim().slice(0, 24);
  const language =
    args.languageCode && LANGS.has(args.languageCode)
      ? args.languageCode
      : null;
  const concern = (args.concern ?? "").trim().slice(0, 1000);

  try {
    const saved = await withAnon((db) =>
      insertExhibitionSignup(db, {
        email,
        whatsapp: whatsapp || null,
        age_band: null,
        language_code: language,
        meno_score: null,
        score_band: null,
        answers: { name, concern, kind: "booking" },
        consent: true,
        marketing_opt_in: false,
        source: "booking",
      }),
    );
    return saved
      ? { ok: true }
      : { ok: false, error: "We could not save your request. Please try again." };
  } catch {
    return { ok: false, error: "We could not save your request. Please try again." };
  }
}
