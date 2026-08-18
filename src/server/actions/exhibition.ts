"use server";

import { createActionClient } from "@/server/supabase/server";
import { insertExhibitionSignup } from "@/server/data/exhibition-signups";
import { sendExhibitionResultsEmail } from "@/server/email";
import { EXHIBITION_QUESTION_IDS, exhibitionStory } from "@/lib/domain/exhibition";
import type { AgeBand, ScoreBand } from "@/lib/types/database";

const KNOWN_LANGS = new Set(["en", "zu", "xh", "af"]);
const BANDS = new Set<ScoreBand>(["mild", "moderate", "significant"]);
const AGE_BANDS = new Set<AgeBand>(["40-44", "45-49", "50-54", "55-59", "60plus", "none"]);
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const WHATSAPP_RE = /^[+0-9][0-9 ()-]{5,19}$/;

/**
 * Festival email capture: stores the signup and sends the results email.
 * Each half is independently best-effort — a Resend outage never blocks the
 * DB save and vice versa. Consent is required at this trust boundary; the
 * caller's checkbox is the POPIA consent event and it lands on the row.
 */
export async function submitExhibitionSignup(args: {
  email: string;
  whatsapp?: string | null;
  ageBand?: AgeBand | null;
  languageCode: string | null;
  menoScore: number;
  scoreBand: ScoreBand;
  answers: Record<string, unknown>;
  consent: boolean;
  marketingOptIn?: boolean;
}): Promise<{ saved: boolean; emailed: boolean }> {
  if (!args.consent) return { saved: false, emailed: false };
  const email = (args.email ?? "").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { saved: false, emailed: false };
  }

  const lang =
    args.languageCode && KNOWN_LANGS.has(args.languageCode) ? args.languageCode : null;
  const scoreBand = BANDS.has(args.scoreBand) ? args.scoreBand : null;
  const menoScore = Math.min(100, Math.max(0, Math.round(args.menoScore)));
  const whatsappRaw = (args.whatsapp ?? "").trim();
  const whatsapp = WHATSAPP_RE.test(whatsappRaw) ? whatsappRaw : null;
  const ageBand = args.ageBand && AGE_BANDS.has(args.ageBand) ? args.ageBand : null;
  // Data minimisation: persist only the curated demo answers, nothing else.
  const answers = Object.fromEntries(
    (EXHIBITION_QUESTION_IDS as readonly number[])
      .map((id) => [id, args.answers?.[String(id)] ?? args.answers?.[id as never]])
      .filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>;

  let saved = false;
  try {
    const db = createActionClient();
    saved =
      (await insertExhibitionSignup(db, {
        email,
        whatsapp,
        age_band: ageBand,
        language_code: lang,
        meno_score: menoScore,
        score_band: scoreBand,
        answers,
        consent: true,
        marketing_opt_in: args.marketingOptIn === true,
      })) !== null;
  } catch {
    /* best-effort — never strand a visitor at the stand */
  }

  let emailed = false;
  try {
    // Derive the felt domains server-side from the validated answers — the
    // email's fact list is never driven by client-sent text.
    const numericAnswers = Object.fromEntries(
      Object.entries(answers).filter(([, v]) => typeof v === "number"),
    ) as Record<number, unknown>;
    const domains = exhibitionStory(numericAnswers).map((c) => c.domain);
    emailed = await sendExhibitionResultsEmail({
      to: email,
      lang: (lang ?? "en") as "en" | "zu" | "xh" | "af",
      domains,
    });
  } catch {
    /* best-effort */
  }

  return { saved, emailed };
}
