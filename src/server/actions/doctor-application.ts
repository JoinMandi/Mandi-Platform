"use server";

import { DOCTOR_LANGUAGES } from "@/lib/domain/doctor-languages";
import { insertExhibitionSignup } from "@/server/data/exhibition-signups";
import { withAnon } from "@/server/db/withUser";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HPCSA_RE = /^MP\s?\d{7}$/i;
const LANGUAGES = new Set<string>(DOCTOR_LANGUAGES);

export interface DoctorApplication {
  name: string;
  hpcsa: string;
  email: string;
  phone: string;
  training: string;
  languages: string[];
  consent: boolean;
  contactConsent: boolean;
}

/**
 * Stores a doctor-panel application as a lead in web.exhibition_signups.
 * The structured fields live in `answers`; nothing is returned to the caller
 * because the table is admin-read only.
 */
export async function applyDoctor(
  args: DoctorApplication,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = args.name.trim();
  const hpcsa = args.hpcsa.trim().toUpperCase().replace(/\s+/g, " ");
  const email = args.email.trim().toLowerCase();
  const phone = args.phone.trim().slice(0, 24);
  const training = args.training.trim().slice(0, 500);
  const languages = Array.from(
    new Set(
      (Array.isArray(args.languages) ? args.languages : []).filter((l) =>
        LANGUAGES.has(l),
      ),
    ),
  );

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!HPCSA_RE.test(hpcsa)) {
    return {
      ok: false,
      error: "Please enter your HPCSA number as MP followed by 7 digits.",
    };
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (phone.length < 9 || phone.length > 20) {
    return { ok: false, error: "Please enter a mobile number." };
  }
  if (!args.consent) {
    return { ok: false, error: "Please agree to the POPIA notice to apply." };
  }

  try {
    const saved = await withAnon((db) =>
      insertExhibitionSignup(db, {
        email,
        whatsapp: phone || null,
        age_band: null,
        language_code: null,
        meno_score: null,
        score_band: null,
        answers: {
          kind: "doctor-application",
          name,
          hpcsa,
          training,
          languages,
          contactConsent: Boolean(args.contactConsent),
        },
        consent: true,
        marketing_opt_in: Boolean(args.contactConsent),
        source: "doctor-application",
      }),
    );
    return saved
      ? { ok: true }
      : { ok: false, error: "We could not save your application. Please try again." };
  } catch {
    return { ok: false, error: "We could not save your application. Please try again." };
  }
}
