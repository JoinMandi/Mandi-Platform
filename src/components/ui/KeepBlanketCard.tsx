"use client";

/**
 * Post-score invitation on /roadmap: "keep your blanket safe". An invitation,
 * never a gate — nothing on the page is hidden behind it. Reuses the
 * exhibition capture action/table with `source: "roadmap"`.
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { submitExhibitionSignup } from "@/server/actions/exhibition";
import { logEngagement } from "@/server/actions/engagement";
import type { ScoreBand } from "@/lib/domain/scoring";

const KEPT_KEY = "mandi-kept";

export default function KeepBlanketCard({
  menoScore,
  scoreBand,
  answers,
}: {
  menoScore: number;
  scoreBand: ScoreBand;
  answers: Record<number, unknown> | null;
}) {
  const { t, i18n } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [sending, setSending] = useState(false);
  const [kept, setKept] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEPT_KEY)) setKept(true);
  }, []);

  const submit = async () => {
    if (!email || !consent || sending) return;
    setSending(true);
    const lang = i18n.language?.slice(0, 2) ?? null;
    const { saved } = await submitExhibitionSignup({
      email,
      whatsapp: whatsapp || null,
      languageCode: lang,
      menoScore,
      scoreBand,
      answers: (answers ?? {}) as Record<string, unknown>,
      consent,
      marketingOptIn: marketing,
      source: "roadmap",
    });
    setSending(false);
    // Placeholder Supabase locally makes saved=false; the thanks state still
    // shows so the visitor is never stranded, and we never re-nag on return.
    localStorage.setItem(KEPT_KEY, new Date().toISOString());
    setKept(true);
    void logEngagement({
      eventType: "keep_submit",
      targetId: "/roadmap",
      sessionId: localStorage.getItem("mandi-session"),
      meta: { lang, score_band: scoreBand, source: saved ? "saved" : "unsaved" },
    });
  };

  return (
    <div className="mt-6 bg-cream-soft rounded-4xl shadow-warm-lg p-7 sm:p-9">
      <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
        {t("roadmap.keep.eyebrow")}
      </p>
      {kept ? (
        <>
          <h2 className="mt-3 font-display text-2xl text-brown leading-tight">
            {t("roadmap.keep.thanksTitle")}
          </h2>
          <p className="mt-3 text-sm text-brown/75 leading-relaxed">
            {t("roadmap.keep.thanksBody")}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-3 font-display text-2xl text-brown leading-tight">
            {t("roadmap.keep.title")}
          </h2>
          <p className="mt-3 text-sm text-brown/75 leading-relaxed">{t("roadmap.keep.body")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("exhibition.email.placeholder")}
              className="w-full rounded-2xl border-2 border-coral/30 bg-white px-5 py-4 text-brown placeholder:text-brown/40 focus:border-terra focus:outline-none"
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-brown/60">
                {t("exhibition.capture.whatsapp")}
              </label>
              <input
                type="tel"
                maxLength={20}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder={t("exhibition.capture.whatsappPlaceholder")}
                className="w-full rounded-2xl border-2 border-coral/30 bg-white px-5 py-4 text-brown placeholder:text-brown/40 focus:border-terra focus:outline-none"
              />
            </div>
            <ConsentCheckbox
              label={t("roadmap.keep.consent")}
              checked={consent}
              onChange={setConsent}
              required
            />
            {/* Separate, explicit, unticked — never bundled with consent. */}
            <ConsentCheckbox
              label={t("exhibition.capture.marketing")}
              checked={marketing}
              onChange={setMarketing}
            />
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={!email || !consent || sending}
              className="w-full"
            >
              {sending ? "…" : `${t("roadmap.keep.submit")} →`}
            </Button>
            <p className="text-center text-xs leading-relaxed text-brown/50">
              {t("exhibition.capture.finePrint")}
            </p>
          </form>
        </>
      )}
    </div>
  );
}
