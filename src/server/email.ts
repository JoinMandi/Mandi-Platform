/**
 * Server-only email sending via the Resend HTTP API — no SDK dependency,
 * one endpoint. Best-effort by design: every failure path returns false so
 * a mail outage can never block a funnel.
 *
 * Env: RESEND_API_KEY (secret), RESEND_FROM (e.g. `Mandi <hello@joinmandi.com>`).
 * Ops prerequisite: verify the domain in Resend + SPF/DKIM DNS records,
 * or mail lands in spam.
 */
import en from "../../public/locales/en/common.json";
import af from "../../public/locales/af/common.json";
import zu from "../../public/locales/zu/common.json";
import xh from "../../public/locales/xh/common.json";

type Lang = "en" | "zu" | "xh" | "af";

// The server can't use the client i18next instance, but it CAN import the
// same locale JSONs — so the per-domain facts in the email stay identical to
// (and clinically reviewed with) the ones on the results page.
interface LocaleDict {
  questionnaire: {
    facts: Record<string, string>;
    domain: Record<string, { title: string }>;
  };
}
const LOCALES: Record<Lang, LocaleDict> = { en, af, zu, xh };

// Email chrome copy lives here — 4×4 short strings don't justify wiring
// i18next server-side. zu/xh/af drafts pending translator review (same path
// as public/locales/CLINICAL-REVIEW.md).
const COPY: Record<
  Lang,
  { subject: string; greeting: string; highlights: string; cta: string; disclaimer: string }
> = {
  en: {
    subject: "Your Mandi blanket is waiting",
    greeting: "Thank you for stitching with us at the Silwerskermfees.",
    highlights: "Your blanket highlighted these areas — and why they happen:",
    cta: "Your full blanket is waiting — finish it at joinmandi.com",
    disclaimer: "Educational information only — not medical advice.",
  },
  af: {
    subject: "Jou Mandi-kombers wag vir jou",
    greeting: "Dankie dat jy saam met ons gestik het by die Silwerskermfees.",
    highlights: "Jou kombers het hierdie areas uitgelig — en hoekom dit gebeur:",
    cta: "Jou volle kombers wag — voltooi dit by joinmandi.com",
    disclaimer: "Slegs opvoedkundige inligting — nie mediese advies nie.",
  },
  zu: {
    subject: "Ingubo yakho yeMandi ikulindile",
    greeting: "Siyabonga ngokuthunga nathi eSilwerskermfees.",
    highlights: "Ingubo yakho igqamise lezi zindawo — nokuthi kungani zenzeka:",
    cta: "Ingubo yakho ephelele ikulindile — yiqedele ku-joinmandi.com",
    disclaimer: "Ulwazi lwemfundo kuphela — akusiyo iseluleko sezokwelapha.",
  },
  xh: {
    subject: "Ingubo yakho yeMandi ikulindile",
    greeting: "Enkosi ngokuthunga nathi eSilwerskermfees.",
    highlights: "Ingubo yakho iqaqambise ezi ndawo — nokuba kutheni zisenzeka:",
    cta: "Ingubo yakho epheleleyo ikulindile — yigqibezele ku-joinmandi.com",
    disclaimer: "Lulwazi lwemfundo kuphela — ayisosiluleko sonyango.",
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendExhibitionResultsEmail(args: {
  to: string;
  lang: Lang;
  /** Symptom domains the visitor actually felt — derived server-side. */
  domains: string[];
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return false;

  const c = COPY[args.lang] ?? COPY.en;
  const locale = LOCALES[args.lang] ?? LOCALES.en;
  const facts = locale.questionnaire.facts;
  const domainTitles = locale.questionnaire.domain;

  const factBlocks = args.domains
    .filter((d) => facts[d])
    .map(
      (d) => `
    <div style="margin:0 0 16px; padding:14px 16px; background:#F4ECE4; border-radius:16px;">
      <p style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#C94A2B; font-weight:600; margin:0 0 6px;">${escapeHtml(domainTitles[d]?.title ?? d)}</p>
      <p style="font-size:14px; line-height:1.6; margin:0;">${escapeHtml(facts[d])}</p>
    </div>`,
    )
    .join("");

  const html = `
<div style="font-family: Montserrat, Arial, sans-serif; background:#F4ECE4; padding:32px;">
  <div style="max-width:520px; margin:0 auto; background:#FBF6EF; border-radius:24px; padding:32px; color:#673C33;">
    <h1 style="color:#C94A2B; font-size:24px; margin:0 0 16px;">Mandi</h1>
    <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">${c.greeting}</p>
    ${factBlocks ? `<p style="font-size:15px; font-weight:600; margin:0 0 12px;">${c.highlights}</p>${factBlocks}` : ""}
    <a href="https://joinmandi.com" style="display:inline-block; margin-top:8px; background:#C94A2B; color:#F4ECE4; text-decoration:none; padding:12px 24px; border-radius:9999px; font-weight:600;">${c.cta}</a>
    <p style="font-size:11px; color:#673C33; opacity:0.6; margin:20px 0 0;">${c.disclaimer}</p>
  </div>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: args.to, subject: c.subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
