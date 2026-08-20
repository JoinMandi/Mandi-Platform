"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import StitchDivider from "@/components/ui/StitchDivider";
import PersonalQuilt from "@/components/journey/PersonalQuilt";
import ResponseSummary from "@/components/journey/ResponseSummary";
import { fetchMyJourney, logSymptom } from "@/server/actions/journey";
import type {
  QuestionnaireResponseRow,
  SymptomLogRow,
  CheckinRow,
  TrackerSymptom,
} from "@/lib/types/database";

/**
 * Phase 21: replaced the 7 broad questionnaire-derived domains
 * (Mind / Mood / Nerves / Body / Cycle / Other / Life) with 8 concrete
 * day-to-day menopause symptoms. Same DB column (`symptom_logs.domain`),
 * same 0–3 score scale, just rate-able things she'd actually recognise.
 */
const TRACKER_SYMPTOMS: TrackerSymptom[] = [
  "hot-flushes",
  "sleep",
  "mood",
  "brain-fog",
  "vaginal-discomfort",
  "joint-pain",
  "anxiety",
  "energy",
];

export default function MyJourneyPage() {
  const { t } = useTranslation("common");
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [latest, setLatest] = useState<QuestionnaireResponseRow | null>(null);
  const [logs, setLogs] = useState<SymptomLogRow[]>([]);
  const [checkins, setCheckins] = useState<CheckinRow[]>([]);

  useEffect(() => {
    void (async () => {
      const result = await fetchMyJourney();
      if (!result) {
        setLoading(false);
        return;
      }
      setLoggedIn(true);
      setEmail(result.email);
      setLatest(result.latest);
      setLogs(result.logs);
      setCheckins(result.checkins);
      setLoading(false);
    })();
  }, []);

  // An email prefix is not a name — greet warmly without pretending to know it.
  const firstName = null;

  const updateLog = async (date: string, domain: string, score: number) => {
    if (!loggedIn) return;
    // optimistic
    setLogs((prev) => {
      const idx = prev.findIndex((l) => l.logged_date === date && l.domain === domain);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], score };
        return next;
      }
      return [
        ...prev,
        {
          id: `tmp-${date}-${domain}`,
          user_id: null,
          logged_date: date,
          domain,
          score,
          created_at: "",
        },
      ];
    });
    const saved = await logSymptom(date, domain, score);
    if (saved) {
      setLogs((prev) =>
        prev.map((l) =>
          l.logged_date === date && l.domain === domain ? saved : l,
        ),
      );
    }
  };

  const openDoctorSummary = () => {
    // Open in a new tab. The print page calls window.print() on mount
    // after a short delay; the user saves as PDF from the browser's
    // print dialog.
    window.open("/my-journey/doctor-summary", "_blank", "noopener");
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-brown/50 text-sm">{t("journey.loading")}</p>
        </main>
      </>
    );
  }

  if (!loggedIn) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center px-6">
          <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 max-w-md text-center">
            <p className="font-display text-2xl text-brown mb-3">{t("journey.signedOutTitle")}</p>
            <Link href="/auth/login" className="link-warm text-terra">
              {t("journey.signedOutCta")} →
            </Link>
          </div>
        </main>
      </>
    );
  }

  const checkinStatus = computeCheckinStatus(latest, checkins);
  const answers = (latest?.answers as Record<number, unknown> | null) ?? null;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero greeting */}
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="absolute inset-0 bg-cream/25" />
          <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
            <Reveal>
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-2">
                {t("journey.eyebrow")}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-brown leading-tight">
                {firstName
                  ? t("journey.greeting", { name: firstName })
                  : t("journey.greetingNoName")}
              </h1>
              <p className="text-brown/70 text-sm mt-2">{t("journey.intro")}</p>
            </Reveal>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
          {/* Phase 21: her unique Mandi Blanket. Only renders when she
              has completed the questionnaire (PersonalQuilt returns null
              for empty patches). */}
          {latest && (
            <Reveal>
              <PersonalQuilt answers={answers} />
            </Reveal>
          )}

          {latest && <StitchDivider tone="gold" />}

          <Reveal delay={60}>
            <ResponseSummary latest={latest} />
          </Reveal>

          {/* Download for doctor — only shown once she has a response. */}
          {latest && (
            <Reveal delay={120}>
              <DoctorDownloadCta onDownload={openDoctorSummary} />
            </Reveal>
          )}

          <StitchDivider tone="gold" />

          <Reveal delay={180}>
            <SymptomTracker logs={logs} onChange={updateLog} />
          </Reveal>

          <StitchDivider tone="gold" />

          <Reveal delay={240}>
            <CheckIns latest={latest} status={checkinStatus} />
          </Reveal>
        </div>
      </main>
    </>
  );
}

// ───────────────────────────────────────────────────────────────

/** Phase 21: standalone CTA card prompting her to download the
 *  doctor-ready summary. Print-to-PDF via the browser; no library. */
function DoctorDownloadCta({ onDownload }: { onDownload: () => void }) {
  const { t } = useTranslation("common");
  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-1">
          {t("journey.pdf.ctaEyebrow")}
        </p>
        <h2 className="font-display text-xl text-brown leading-snug">
          {t("journey.pdf.ctaTitle")}
        </h2>
        <p className="text-brown/65 text-sm mt-1 max-w-xl leading-relaxed">
          {t("journey.pdf.ctaBody")}
        </p>
      </div>
      <Button onClick={onDownload} variant="primary">
        {t("journey.pdf.ctaButton")} →
      </Button>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────

function SymptomTracker({
  logs,
  onChange,
}: {
  logs: SymptomLogRow[];
  onChange: (date: string, domain: string, score: number) => void;
}) {
  const { t } = useTranslation("common");
  const [editing, setEditing] = useState<{ date: string; domain: string } | null>(null);
  const days = useMemo(() => last7Days(), []);

  const getScore = (date: string, domain: string): number | null => {
    const log = logs.find((l) => l.logged_date === date && l.domain === domain);
    return log ? (log.score ?? null) : null;
  };

  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-7 sm:p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
        {t("journey.tracker.eyebrow")}
      </p>
      <h2 className="font-display text-2xl text-brown mb-2">{t("journey.tracker.title")}</h2>
      <p className="text-brown/65 text-sm mb-6">{t("journey.tracker.intro")}</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr>
              <th className="text-left pb-3 pr-4 text-[11px] uppercase tracking-wider text-brown/50 font-semibold"></th>
              {days.map((d) => {
                const dt = new Date(d);
                return (
                  <th key={d} className="pb-3 px-1 text-[10px] uppercase tracking-wider text-brown/50 font-semibold text-center">
                    <div className="font-display text-lg text-brown leading-none">
                      {dt.getDate()}
                    </div>
                    <div>{dt.toLocaleDateString(undefined, { weekday: "short" })}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TRACKER_SYMPTOMS.map((symptom) => (
              <tr key={symptom} className="border-t border-cream-deep/40">
                <td className="py-3 pr-4">
                  <div className="text-sm font-semibold text-brown leading-tight">
                    {t(`journey.tracker.symptom.${symptom}.label`)}
                  </div>
                  <div className="text-[11px] text-brown/55 leading-snug mt-0.5">
                    {t(`journey.tracker.symptom.${symptom}.hint`)}
                  </div>
                </td>
                {days.map((day) => {
                  const score = getScore(day, symptom);
                  const isEditing =
                    editing?.date === day && editing?.domain === symptom;
                  return (
                    <td key={day} className="py-1 text-center align-top">
                      <button
                        onClick={() => setEditing({ date: day, domain: symptom })}
                        className={`w-11 h-11 rounded-full inline-flex items-center justify-center font-semibold text-sm
                          transition-colors
                          ${score === null ? "bg-cream border border-cream-deep text-brown/30" :
                            score === 0 ? "bg-cream-deep text-brown/50" :
                            score === 1 ? "bg-golden/50 text-brown" :
                            score === 2 ? "bg-coral text-cream" :
                                          "bg-terra text-cream"}`}
                        aria-label={`Score ${score ?? "none"} for ${symptom} on ${day}`}
                      >
                        {score === null ? "·" : score}
                      </button>
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="relative"
                          >
                            <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 bg-cream-soft border border-cream-deep rounded-2xl shadow-warm-lg p-2 flex gap-1">
                              {[0, 1, 2, 3].map((n) => (
                                <button
                                  key={n}
                                  onClick={() => {
                                    onChange(day, symptom, n);
                                    setEditing(null);
                                  }}
                                  className="w-10 h-10 rounded-full text-sm font-semibold bg-cream hover:bg-terra hover:text-cream text-brown transition-colors"
                                >
                                  {n}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditing(null)}
                                className="w-10 h-10 rounded-full text-brown/50 hover:text-terra text-sm"
                                aria-label="Cancel"
                              >
                                ✕
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-brown/50 mt-5 leading-relaxed">
        {t("journey.tracker.scale")}
      </p>
    </section>
  );
}

// ───────────────────────────────────────────────────────────────

type CheckinKey = "6week" | "3month";
type CheckinState = "upcoming" | "available" | "completed";
type CheckinStatusMap = Record<CheckinKey, { state: CheckinState; checkin?: CheckinRow }>;

function computeCheckinStatus(
  latest: QuestionnaireResponseRow | null,
  checkins: CheckinRow[],
): CheckinStatusMap {
  const six = checkins.find((c) => c.type === "6week" && c.completed_at);
  const three = checkins.find((c) => c.type === "3month" && c.completed_at);

  if (!latest) {
    return {
      "6week": { state: "upcoming" },
      "3month": { state: "upcoming" },
    };
  }

  const startDate = new Date(latest.completed_at);
  const now = Date.now();
  const weeks = (now - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7);

  return {
    "6week": six
      ? { state: "completed", checkin: six }
      : weeks >= 6
      ? { state: "available" }
      : { state: "upcoming" },
    "3month": three
      ? { state: "completed", checkin: three }
      : weeks >= 12
      ? { state: "available" }
      : { state: "upcoming" },
  };
}

function CheckIns({
  latest,
  status,
}: {
  latest: QuestionnaireResponseRow | null;
  status: CheckinStatusMap;
}) {
  const { t } = useTranslation("common");
  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
        {t("journey.checkins.eyebrow")}
      </p>
      <h2 className="font-display text-2xl text-brown mb-2">{t("journey.checkins.title")}</h2>
      <p className="text-brown/65 text-sm mb-6">{t("journey.checkins.intro")}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <CheckinCard
          titleKey="journey.checkins.sixWeek"
          subtitleKey="journey.checkins.sixWeekSub"
          state={status["6week"].state}
          disabled={!latest}
          beforeScore={latest?.meno_score ?? undefined}
        />
        <CheckinCard
          titleKey="journey.checkins.threeMonth"
          subtitleKey="journey.checkins.threeMonthSub"
          state={status["3month"].state}
          disabled={!latest}
          beforeScore={latest?.meno_score ?? undefined}
        />
      </div>
    </section>
  );
}

function CheckinCard({
  titleKey, subtitleKey, state, disabled, beforeScore,
}: {
  titleKey: string;
  subtitleKey: string;
  state: CheckinState;
  disabled?: boolean;
  beforeScore?: number;
}) {
  const { t } = useTranslation("common");

  const pillColor =
    state === "available" ? "bg-coral/25 text-terra" :
    state === "completed" ? "bg-golden/30 text-brown" :
    "bg-brown/10 text-brown/60";

  const pillLabel =
    state === "available" ? t("journey.checkins.stateAvailable") :
    state === "completed" ? t("journey.checkins.stateCompleted") :
    t("journey.checkins.stateUpcoming");

  return (
    <article className="bg-cream rounded-3xl p-6 border-l-4 border-pink-mandi shadow-warm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-lg text-brown">{t(titleKey)}</h3>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${pillColor}`}>
          {pillLabel}
        </span>
      </div>
      <p className="text-brown/65 text-sm leading-relaxed mb-4">{t(subtitleKey)}</p>

      {state === "available" && (
        <Link href="/questionnaire?checkin=1">
          <Button variant="primary" size="sm" disabled={disabled}>
            {t("journey.checkins.start")} →
          </Button>
        </Link>
      )}

      {state === "upcoming" && (
        <p className="text-xs text-brown/50 italic">{t("journey.checkins.upcomingNote")}</p>
      )}

      {state === "completed" && beforeScore !== undefined && (
        <p className="text-xs text-brown/55">
          {t("journey.checkins.completedNote", { score: beforeScore })}
        </p>
      )}
    </article>
  );
}

// ───────────────────────────────────────────────────────────────

function last7Days(): string[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return isoDate(d);
  });
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
