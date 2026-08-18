"use client";

/**
 * Silwerskermfees exhibition demo — a curated 8-question taste of Mandi.
 * Runs as a kiosk tablet (?kiosk=1: attract screen + 90s idle auto-reset)
 * and on visitors' phones via QR (default). Everything is in-memory: no
 * questionnaire-progress save/resume, no mandi-score/answers/session writes,
 * so the real /questionnaire → /roadmap flow is untouched. Only localStorage
 * touch is mandi-lang (so a phone visitor keeps her language on the full site).
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import PetalBurst from "@/components/ui/PetalBurst";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import ProgressBar from "@/components/ui/ProgressBar";
import QuestionScreen from "@/components/ui/QuestionScreen";
import Quilt from "@/components/ui/Quilt";
import Reveal from "@/components/ui/Reveal";
import ScaleInput from "@/components/ui/ScaleInput";
import StitchDivider from "@/components/ui/StitchDivider";
import type { AgeBand } from "@/lib/types/database";
import {
  calculateExhibitionScore,
  exhibitionQuestions,
  exhibitionStory,
  type ExhibitionScoreResult,
} from "@/lib/domain/exhibition";
import { buildQuilt } from "@/lib/domain/quilt";
import { submitExhibitionSignup } from "@/server/actions/exhibition";

type Step =
  | "attract"
  | "language"
  | "consent"
  | "question"
  | "story"
  | "thanks";

/** How the 8 questions are presented. Kiosk uses "pages" (variant B); phone
 *  uses "chat" — the taps cadence stays reachable via ?mode=taps for
 *  side-by-side comparison during rehearsal, with no visitor-facing chooser. */
type QMode = "pages" | "taps" | "chat";

const LANGUAGES = [
  { code: "en", label: "Talk to Mandi", sub: "English" },
  { code: "zu", label: "Khuluma noMandi", sub: "isiZulu" },
  { code: "xh", label: "Thetha noMandi", sub: "isiXhosa" },
  { code: "af", label: "Praat met Mandi", sub: "Afrikaans" },
];

// Attract runs before a language is chosen, so its CTA shows all four.
const ATTRACT_CTAS = ["Tap to begin", "Tik om te begin", "Thepha ukuqala", "Cofa ukuqalisa"];

const IDLE_RESET_MS = 90_000;
const THANKS_RESET_MS = 12_000;
const CHAT_PAUSE_MS = 700; // typing-indicator pause before the next question
const KIOSK_PAGE_SIZE = 4; // prototype variant B: four cards per screen

// Oldest to youngest, per product direction — 20s/30s included so younger
// visitors can join the journey without the form implying they don't belong.
const AGE_BANDS: AgeBand[] = [
  "60plus",
  "55-59",
  "50-54",
  "45-49",
  "40-44",
  "30-39",
  "20-29",
  "none",
];

type ChatEntry = { role: "me" | "mandi"; text: string };

// No skipConditions in the curated set — the quilt is static: 8 patches, one row.
const PATCHES = buildQuilt(exhibitionQuestions);
const GOLDEN_ID = PATCHES.find((p) => p.isGolden)?.questionId;
const TOTAL = exhibitionQuestions.length;

// I18nProvider remounts the subtree when the language changes, wiping local
// state. This module-scope handoff tells the fresh mount which step to land
// on (set right before changeLanguage, read+cleared on mount).
let bootStep: Step | null = null;

// Published evidence behind the questionnaire.facts.* strings — same pattern
// as the HRT page's SOURCES array (English-only, per that precedent). The
// claim→citation verification table lives in docs/FACTS-SOURCES.md.
const FACT_SOURCES = [
  "Harlow SD et al. STRAW+10. Menopause 2012;19(4):387–395.",
  "Santoro N. J Womens Health 2016;25(4):332–339.",
  "Maki PM, Jaff NG. Climacteric 2022;25(6):570–578.",
  "Greendale GA et al. Neurology 2009;72(21):1850–1857.",
  "Amin Z et al. Behav Cogn Neurosci Rev 2005;4(1):43–58.",
  "Avis NE et al. JAMA Intern Med 2015;175(4):531–539.",
  "Wright VJ et al. Climacteric 2024;27(5):466–472.",
  "NAMS. Menopause 2020;27(9):976–992 (GSM position statement).",
  "Zierau O et al. Front Immunol 2012;3:169.",
  "O'Neill MT et al. Occup Med 2023;73(6):332–338.",
  "NICE Guideline NG23, 2015 (updated 2019).",
  "Newson Health Research Team, symptom-prevalence data, Feb 2025.",
];

const PETAL_COLORS = ["#F2C14E", "#F07B54", "#E66C84", "#F5A623", "#C94A2B"];

/** Petal ring from TransitionScreen — the reveal's celebratory bloom. */
function Bloom() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: `calc(50% + ${Math.cos(angle) * 12}px)`,
              top: `calc(44% + ${Math.sin(angle) * 12}px)`,
              animation: `bloom 2.4s ease-out ${i * 90}ms forwards`,
            }}
          >
            <span
              className="block h-3.5 w-3.5"
              style={{
                background: PETAL_COLORS[i % PETAL_COLORS.length],
                borderRadius: "50% 50% 50% 0",
                transform: `rotate(${angle + Math.PI / 4}rad)`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}

export default function ExhibitionPage() {
  const { t, i18n } = useTranslation("common");

  const [step, setStep] = useState<Step | null>(null);
  const [kiosk, setKiosk] = useState(false);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [score, setScore] = useState<ExhibitionScoreResult | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const [bursting, setBursting] = useState<string | null>(null);
  const [qMode, setQMode] = useState<QMode>("chat");
  // Variant B (kiosk): paged cards
  const [page, setPage] = useState(0);
  // Variant A (phone "taps"): one question per screen
  const [tapIdx, setTapIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  // Variant C (phone "chat")
  const [chatIdx, setChatIdx] = useState(0);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  // Capture form
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [emailConsent, setEmailConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [sending, setSending] = useState(false);

  const chatTimer = useRef<number | undefined>(undefined);
  const advanceTimer = useRef<number | undefined>(undefined);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const answeredCount = exhibitionQuestions.filter(
    (q) => typeof answers[q.id] === "number",
  ).length;

  // ── Boot: kiosk detection + language-remount handoff ─────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isKiosk = params.has("kiosk");
    setKiosk(isKiosk);
    setQMode(isKiosk ? "pages" : params.get("mode") === "taps" ? "taps" : "chat");
    // Idempotent under StrictMode's double-run: consume bootStep once, and
    // never overwrite a step that a previous run (or handoff) already set.
    const handoff = bootStep;
    bootStep = null;
    // Everyone opens on the full-bleed gradient attract screen — it's the
    // brand moment; a phone visitor taps once to reach the language picker.
    setStep((prev) => prev ?? handoff ?? "attract");
  }, []);

  const resetAll = () => {
    window.clearTimeout(chatTimer.current);
    window.clearTimeout(advanceTimer.current);
    setAnswers({});
    setScore(null);
    setAffirmation(null);
    setBursting(null);
    // qMode is URL-derived (kiosk/mode params) — survives reset untouched.
    setPage(0);
    setTapIdx(0);
    setExpanded(false);
    setChatIdx(0);
    setChatLog([]);
    setChatBusy(false);
    setEmail("");
    setWhatsapp("");
    setAgeBand(null);
    setEmailConsent(false);
    setMarketingOptIn(false);
    setSending(false);
    const target: Step = "attract";
    if (i18n.language !== "en") {
      bootStep = target; // changeLanguage remounts; fresh mount lands on target
      void i18n.changeLanguage("en");
    }
    setStep(target); // covers the no-remount (already-English) path
  };
  const resetRef = useRef(resetAll);
  resetRef.current = resetAll;

  // Every step except attract carries an escape hatch back to the start.
  const restartChip = (
    <button
      type="button"
      onClick={() => resetRef.current()}
      className="fixed right-4 top-4 z-[60] rounded-full border border-brown/15 bg-cream-soft/90 px-4 py-2
        text-xs font-semibold text-brown/60 shadow-warm backdrop-blur-sm transition-colors
        hover:border-terra hover:text-terra"
    >
      ↺ {t("exhibition.restart")}
    </button>
  );

  // ── Kiosk: idle auto-reset ───────────────────────────────────
  useEffect(() => {
    if (!kiosk || !step || step === "attract") return;
    let timer = window.setTimeout(() => resetRef.current(), IDLE_RESET_MS);
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => resetRef.current(), IDLE_RESET_MS);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    window.addEventListener("wheel", arm); // scrolling the story counts as activity
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
      window.removeEventListener("wheel", arm);
    };
  }, [kiosk, step]);

  // ── Kiosk: keep the tablet awake while a visitor is mid-flow ─
  useEffect(() => {
    if (!kiosk) return;
    // ponytail: wake lock only — fullscreen/pinning is the tablet OS's
    // kiosk mode's job, not ours.
    let lock: { release: () => Promise<void> } | null = null;
    void (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<never> } })
      .wakeLock?.request("screen")
      .then((l) => (lock = l))
      .catch(() => {});
    return () => void lock?.release().catch(() => {});
  }, [kiosk]);

  // ── Kiosk: thanks screen auto-returns to attract ─────────────
  useEffect(() => {
    if (!kiosk || step !== "thanks") return;
    const timer = window.setTimeout(() => resetRef.current(), THANKS_RESET_MS);
    return () => window.clearTimeout(timer);
  }, [kiosk, step]);

  // ── Affirmation toast auto-dismiss ───────────────────────────
  useEffect(() => {
    if (!affirmation) return;
    const timer = window.setTimeout(() => setAffirmation(null), 3600);
    return () => window.clearTimeout(timer);
  }, [affirmation]);

  // ── Chat: keep the newest bubble in view ─────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatLog, chatIdx]);

  // ── Handlers ─────────────────────────────────────────────────
  const selectLanguage = (code: string) => {
    if (bursting) return;
    localStorage.setItem("mandi-lang", code);
    const go = () => {
      bootStep = "consent"; // survive the I18nProvider remount
      void i18n.changeLanguage(code);
      setStep("consent"); // covers the no-remount path (same language)
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return go();
    setBursting(code);
    window.setTimeout(go, 460);
  };

  // Score is computed silently for the signup record — never shown.
  const finish = () => {
    setScore(calculateExhibitionScore(answersRef.current));
    setStep("story");
  };

  const maybeAffirm = (qId: number) => {
    if (qId !== GOLDEN_ID) return;
    const n = 1 + Math.floor(Math.random() * 4);
    setAffirmation(t(`questionnaire.affirmations.${n}`));
  };

  // ── Variant B (kiosk): paged cards ───────────────────────────
  const pageQuestions = exhibitionQuestions.slice(
    page * KIOSK_PAGE_SIZE,
    (page + 1) * KIOSK_PAGE_SIZE,
  );
  const pageCount = Math.ceil(TOTAL / KIOSK_PAGE_SIZE);
  const pageDone = pageQuestions.every((q) => typeof answers[q.id] === "number");

  const setCardAnswer = (qId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
    maybeAffirm(qId);
  };

  const nextPage = () => {
    if (!pageDone) return;
    if (page >= pageCount - 1) return finish();
    setPage((p) => p + 1);
    window.scrollTo({ top: 0 });
  };

  // ── Variant C (phone): chat ──────────────────────────────────
  const chatQuestion = exhibitionQuestions[Math.min(chatIdx, TOTAL - 1)];

  const replyFor = (domain: string, value: number) => {
    const level = value >= 2 ? "hi" : "lo";
    const n = 1 + (chatLog.length % 2); // rotate the two lines, prototype-style
    return t(`exhibition.chat.${domain}.${level}.${n}`);
  };

  const answerChat = (value: number) => {
    if (chatBusy || !chatQuestion) return;
    const q = chatQuestion;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    maybeAffirm(q.id);
    // The asked question enters the transcript too — a WhatsApp-style
    // permanent log, not a disappearing prompt.
    setChatLog((log) => [
      ...log,
      { role: "mandi", text: t(`questionnaire.${q.textKey}`) },
      { role: "me", text: t(`questionnaire.scale.${value}`) },
      { role: "mandi", text: replyFor(q.domain, value) },
    ]);
    setChatBusy(true);
    window.clearTimeout(chatTimer.current);
    chatTimer.current = window.setTimeout(() => {
      setChatBusy(false);
      if (chatIdx >= TOTAL - 1) return finish();
      setChatIdx((i) => i + 1);
    }, CHAT_PAUSE_MS);
  };

  const chatBack = () => {
    if (chatBusy || chatIdx === 0) return;
    // Pop the whole exchange: question, her echo, and Mandi's reply.
    setChatLog((log) => log.slice(0, -3));
    setChatIdx((i) => i - 1);
  };

  // ── Variant A (phone "taps"): one question per screen ────────
  const tapQuestion = exhibitionQuestions[Math.min(tapIdx, TOTAL - 1)];

  const tapNext = () => {
    window.clearTimeout(advanceTimer.current);
    const q = exhibitionQuestions[tapIdx];
    if (!q || typeof answersRef.current[q.id] !== "number") return;
    if (tapIdx >= TOTAL - 1) return finish();
    setTapIdx((i) => i + 1);
  };
  const tapNextRef = useRef(tapNext);
  tapNextRef.current = tapNext;

  const tapAnswer = (value: number) => {
    const q = exhibitionQuestions[tapIdx];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    maybeAffirm(q.id);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => tapNextRef.current(), 430);
  };

  const submitEmail = async () => {
    if (!emailConsent || !email || sending || !score) return;
    setSending(true);
    try {
      await submitExhibitionSignup({
        email,
        whatsapp: whatsapp || null,
        ageBand,
        languageCode: i18n.language,
        menoScore: score.menoScore,
        scoreBand: score.scoreBand,
        answers: answers as Record<string, unknown>,
        consent: true,
        marketingOptIn,
      });
    } catch {
      /* best-effort — never strand a visitor at the stand */
    }
    setSending(false);
    setStep("thanks");
  };

  // ── Render ───────────────────────────────────────────────────
  if (!step) return null;

  if (step === "attract") {
    return (
      <main
        onPointerDown={() => setStep("language")}
        className="relative min-h-screen overflow-hidden bg-mandi-gradient-dusk cursor-pointer"
      >
        <AmbientBlobs intensity="full" />
        <div className="pointer-events-none absolute inset-0 bg-brown/30" />
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-golden font-semibold">
            {t("brand.name")} · Silwerskermfees
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-tight text-cream drop-shadow-md sm:text-7xl">
            {t("exhibition.attract.title")}
          </h1>
          <div className="mt-10 w-full max-w-md rounded-5xl border border-cream/25 bg-cream-soft/95 p-5 shadow-warm-xl">
            <Quilt patches={PATCHES} answered={TOTAL} variant="full" reveal className="mx-auto" />
          </div>
          <div className="mt-10 animate-pulse-warm rounded-full bg-terra px-10 py-4 shadow-warm-lg">
            <p className="text-base font-semibold text-cream">{ATTRACT_CTAS[0]}</p>
          </div>
          <p className="mt-4 text-sm font-medium text-cream/80">
            {ATTRACT_CTAS.slice(1).join(" · ")}
          </p>
        </div>
      </main>
    );
  }

  if (step === "language") {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/55" />
        {restartChip}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
          <div className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold text-center mb-2">
                {t("brand.name")}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-brown text-center mb-3">
                {t("language.prompt")}
              </h1>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {LANGUAGES.map((l, i) => {
                const isBursting = bursting === l.code;
                return (
                  <Reveal key={l.code} variant="stitch" delay={i * 70}>
                    <button
                      onClick={() => selectLanguage(l.code)}
                      className={`relative w-full overflow-visible rounded-2xl px-4 py-5 border-2
                        flex flex-col items-center gap-0.5 shadow-warm transition-all duration-200
                        hover:-translate-y-0.5 active:scale-95
                        ${isBursting
                          ? "bg-terra text-cream border-terra"
                          : "bg-white text-brown border-coral/30 hover:bg-terra hover:text-cream hover:border-terra"}`}
                    >
                      <span className="font-semibold text-sm">{l.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.15em] opacity-70">{l.sub}</span>
                      {isBursting && <PetalBurst />}
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (step === "consent") {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/70" />
        {restartChip}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-12 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold mb-3">
              {t("brand.name")}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl text-brown leading-tight mb-5">
              {t("exhibition.consent.title")}
            </h1>
            <p className="text-brown/80 text-sm sm:text-base leading-relaxed mb-8">
              {t("exhibition.consent.body")}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full animate-pulse-warm"
              onClick={() => setStep("question")}
            >
              {t("exhibition.consent.cta")} →
            </Button>
          </motion.div>
        </div>
      </main>
    );
  }

  if (step === "question" && qMode === "taps" && tapQuestion) {
    // Variant A — one question per screen, 430ms auto-advance (the v2 cadence).
    const currentAnswer = answers[tapQuestion.id];
    return (
      <>
        {restartChip}
        <QuestionScreen
          current={tapIdx + 1}
          total={TOTAL}
          domain={tapQuestion.domain}
          onBack={() => {
            window.clearTimeout(advanceTimer.current);
            if (tapIdx > 0) setTapIdx((i) => i - 1);
          }}
          showBack={tapIdx > 0}
          patches={PATCHES}
          answeredCount={answeredCount}
          onQuiltTap={() => setExpanded(true)}
          showTime={false}
        >
          <div key={tapQuestion.id} className="flex flex-col gap-6 animate-rise-in">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl text-brown leading-tight px-2">
                {t(`questionnaire.${tapQuestion.textKey}`)}
              </h2>
              {tapQuestion.hintKey && (
                <p className="mt-3 text-sm text-brown/60 italic leading-relaxed max-w-md mx-auto">
                  {t(`questionnaire.${tapQuestion.hintKey}`)}
                </p>
              )}
            </div>

            <ScaleInput
              value={typeof currentAnswer === "number" ? currentAnswer : null}
              onChange={tapAnswer}
            />

            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={tapNext}
                disabled={typeof currentAnswer !== "number"}
                className="w-full"
              >
                {tapIdx < TOTAL - 1 ? t("questionnaire.next") : t("questionnaire.finish")}
              </Button>
            </div>
          </div>
        </QuestionScreen>

        {expanded && (
          <div
            onClick={() => setExpanded(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brown/70 backdrop-blur-sm px-6 animate-fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-4xl bg-cream-soft p-6 shadow-warm-xl animate-rise-in"
            >
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-terra">
                {t("questionnaire.quiltHeading")}
              </p>
              <div className="mt-5">
                <Quilt patches={PATCHES} answered={answeredCount} variant="full" className="mx-auto" />
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="mx-auto mt-6 block rounded-full bg-terra px-9 py-2.5 text-sm font-semibold text-cream hover:bg-terra-dark transition-colors"
              >
                {t("questionnaire.quiltClose")}
              </button>
            </div>
          </div>
        )}

        {affirmation && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brown px-5 py-3 text-sm font-medium text-cream shadow-warm-xl animate-rise-in">
            <span className="text-golden">✦</span> {affirmation}
          </div>
        )}
      </>
    );
  }

  if (step === "question" && qMode === "pages") {
    // Variant B — four cards per screen, gate until all answered.
    return (
      <div className="relative min-h-screen bg-cream overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-mandi-gradient-soft opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-cream/60" />
        {restartChip}
        <ProgressBar variant="top" current={answeredCount} total={TOTAL} />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pt-6 pb-10">
          <div className="rounded-3xl border border-cream-deep/60 bg-cream-soft/80 p-3 shadow-warm backdrop-blur-sm">
            <Quilt patches={PATCHES} answered={answeredCount} variant="compact" className="mx-auto" />
            <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brown/55">
              {t("questionnaire.patchesStitched", { done: answeredCount, total: TOTAL })}
            </p>
          </div>

          <div className="mt-5 mb-4 flex items-center justify-between">
            {page > 0 ? (
              <button
                onClick={() => setPage(0)}
                type="button"
                className="text-sm font-medium text-brown/60 hover:text-terra transition-colors"
              >
                ← {t("questionnaire.back")}
              </button>
            ) : (
              <span />
            )}
            <span className="text-[11px] uppercase tracking-[0.18em] text-brown/45 font-semibold">
              {page + 1} / {pageCount}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {pageQuestions.map((q) => {
              const v = answers[q.id];
              const anySelected = typeof v === "number";
              return (
                <div
                  key={q.id}
                  className="rounded-3xl border border-cream-deep/50 bg-cream-soft p-5 shadow-warm animate-rise-in"
                >
                  <p className="text-sm font-semibold leading-snug text-brown sm:text-base">
                    {t(`questionnaire.${q.textKey}`)}
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((s) => {
                      const selected = v === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setCardAnswer(q.id, s)}
                          className={`flex flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-3
                            text-xs font-semibold transition-all
                            ${selected
                              ? "bg-terra text-cream border-terra shadow-warm-lg"
                              : "bg-white border-coral/30 text-brown hover:border-terra"}
                            ${anySelected && !selected ? "opacity-55" : ""}`}
                        >
                          <span className="font-display text-xl leading-none">{s}</span>
                          <span className="leading-tight text-center text-[10px] opacity-90">
                            {t(`questionnaire.scale.${s}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="primary" size="lg" onClick={nextPage} disabled={!pageDone} className="w-full">
              {page < pageCount - 1 ? t("questionnaire.next") : t("questionnaire.finish")} →
            </Button>
            {!pageDone && (
              <p className="text-center text-xs font-medium text-brown/50">
                {t("exhibition.capture.pageGate")}
              </p>
            )}
          </div>
        </div>

        {affirmation && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brown px-5 py-3 text-sm font-medium text-cream shadow-warm-xl animate-rise-in">
            <span className="text-golden">✦</span> {affirmation}
          </div>
        )}
      </div>
    );
  }

  if (step === "question" && qMode === "chat" && chatQuestion) {
    // Variant C — chat: messenger layout. Header and chips are pinned; only
    // the conversation scrolls (100dvh lock so phone keyboards/chrome don't
    // push the chips off-screen).
    return (
      <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-cream">
        <div className="pointer-events-none absolute inset-0 bg-mandi-gradient-soft opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-cream/60" />
        {restartChip}
        <ProgressBar variant="top" current={answeredCount} total={TOTAL} />

        {/* Pinned header */}
        <div className="relative z-10 mx-auto w-full max-w-xl shrink-0 px-5 pt-5">
          {/* Quilt dimmed until the story reveals it in full — prototype rule */}
          <div className="rounded-3xl border border-cream-deep/60 bg-cream-soft/80 p-2.5 opacity-75 shadow-warm backdrop-blur-sm">
            <Quilt patches={PATCHES} answered={answeredCount} variant="compact" className="mx-auto" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            {chatIdx > 0 ? (
              <button
                onClick={chatBack}
                type="button"
                className="text-sm font-medium text-brown/60 hover:text-terra transition-colors"
              >
                ← {t("questionnaire.back")}
              </button>
            ) : (
              <span />
            )}
            <span className="text-[11px] uppercase tracking-[0.18em] text-brown/45 font-semibold">
              {t("questionnaire.progress", { current: Math.min(chatIdx + 1, TOTAL), total: TOTAL })}
            </span>
          </div>
        </div>

        {/* The conversation — the only scrolling region */}
        <div className="relative z-10 mx-auto w-full max-w-xl flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          <div className="flex min-h-full flex-col justify-end gap-3">
            {/* Lead-in — Mandi introduces herself before the first question */}
            <div className="max-w-[85%] self-start rounded-3xl rounded-bl-lg border border-cream-deep/50 bg-cream-soft px-4 py-3 text-sm leading-relaxed text-brown shadow-warm">
              {t("exhibition.chat.greeting")}
            </div>
            {chatLog.map((entry, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed animate-rise-in ${
                  entry.role === "me"
                    ? "self-end rounded-br-lg bg-terra text-cream shadow-warm"
                    : "self-start rounded-bl-lg bg-cream-soft text-brown border border-cream-deep/50 shadow-warm"
                }`}
              >
                {entry.text}
              </div>
            ))}
            {chatBusy ? (
              /* Typing indicator — Mandi is "thinking" before the next question */
              <div className="flex max-w-[85%] items-center gap-1.5 self-start rounded-3xl rounded-bl-lg border border-cream-deep/50 bg-cream-soft px-4 py-3.5 shadow-warm animate-rise-in">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full bg-terra/60 animate-pulse-warm"
                    style={{ animationDelay: `${d * 180}ms` }}
                  />
                ))}
              </div>
            ) : (
              <div
                key={`q-${chatQuestion.id}`}
                className="max-w-[85%] self-start rounded-3xl rounded-bl-lg border border-cream-deep/50 bg-cream-soft px-4 py-3 shadow-warm animate-rise-in"
              >
                <p className="text-sm font-semibold leading-snug text-brown">
                  {t(`questionnaire.${chatQuestion.textKey}`)}
                </p>
                {chatQuestion.hintKey && (
                  <p className="mt-1.5 text-xs italic leading-relaxed text-brown/60">
                    {t(`questionnaire.${chatQuestion.hintKey}`)}
                  </p>
                )}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Pinned answer chips */}
        <div className="relative z-10 mx-auto w-full max-w-xl shrink-0 border-t border-cream-deep/40 bg-cream/85 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                disabled={chatBusy}
                onClick={() => answerChat(s)}
                className={`flex flex-col items-center gap-0.5 rounded-2xl border-2 border-coral/30 bg-white
                  px-2 py-3 text-xs font-semibold text-brown transition-all hover:border-terra
                  hover:bg-terra hover:text-cream active:scale-95 ${chatBusy ? "opacity-40" : ""}`}
              >
                <span className="font-display text-xl leading-none">{s}</span>
                <span className="leading-tight text-center text-[10px] opacity-90">
                  {t(`questionnaire.scale.${s}`)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {affirmation && (
          <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brown px-5 py-3 text-sm font-medium text-cream shadow-warm-xl animate-rise-in">
            <span className="text-golden">✦</span> {affirmation}
          </div>
        )}
      </div>
    );
  }

  if (step === "story" && score) {
    const story = exhibitionStory(answers);
    return (
      <main className="relative">
        {restartChip}
        {/* 1 — Hero: the finished blanket */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-mandi-gradient px-5 py-16">
          <div className="pointer-events-none absolute inset-0 bg-brown/20" />
          <Bloom />
          <div className="relative z-10 w-full max-w-md text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-display text-3xl text-cream drop-shadow-md sm:text-4xl"
            >
              {t("exhibition.story.intro.title")}
            </motion.h1>
            <div className="mx-auto mt-6 rounded-5xl border border-cream/25 bg-cream-soft/95 p-6 shadow-warm-xl">
              <Quilt patches={PATCHES} answered={TOTAL} variant="full" reveal className="mx-auto" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-cream/90"
            >
              {t("exhibition.story.intro.sub")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
              className="mt-8 flex justify-center"
            >
              <svg
                className="h-8 w-8 animate-pulse-warm text-golden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7M19 5l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </section>

        {/* 2 — Domain chapters: only what she actually felt */}
        <section className="relative bg-cream px-5 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-mandi-gradient-soft opacity-40" />
          <div className="relative mx-auto flex max-w-xl flex-col gap-10">
            {story.length === 0 ? (
              <Reveal variant="rise">
                <article className="rounded-4xl border border-cream-deep/50 bg-cream-soft p-8 text-center shadow-warm-lg sm:p-10">
                  <h2 className="font-display text-2xl text-brown sm:text-3xl">
                    {t("exhibition.story.none.title")}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-brown/75 sm:text-base">
                    {t("exhibition.story.none.body")}
                  </p>
                </article>
              </Reveal>
            ) : (
              story.map((chapter, i) => (
                <Reveal key={chapter.domain} variant="rise" delay={i * 60}>
                  <article className="rounded-4xl border border-cream-deep/50 bg-cream-soft p-7 shadow-warm-lg sm:p-9">
                    <p className="font-display text-xl leading-snug text-terra sm:text-2xl">
                      {t(`exhibition.story.cute.${chapter.domain}`)}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brown/50">
                      {t(`questionnaire.domain.${chapter.domain}.title`)}
                    </p>
                    <ul className="mt-5 flex flex-col gap-3">
                      {chapter.questions.map((q) => (
                        <li key={q.id} className="flex items-start justify-between gap-4">
                          <span className="text-sm leading-relaxed text-brown sm:text-base">
                            {t(`questionnaire.${q.textKey}`)}
                          </span>
                          {/* stitch knots, not numbers — 1 to 3 filled dots */}
                          <span className="mt-1.5 flex shrink-0 gap-1.5" aria-hidden>
                            {[1, 2, 3].map((d) => (
                              <span
                                key={d}
                                className={`h-2.5 w-2.5 rounded-full ${
                                  d <= q.answer ? "bg-terra" : "bg-brown/15"
                                }`}
                              />
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="my-6">
                      <StitchDivider tone="gold" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-golden">
                      {t("exhibition.story.factLabel")}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-brown/80 sm:text-base">
                      {t(`questionnaire.facts.${chapter.factKey}`)}
                    </p>
                  </article>
                </Reveal>
              ))
            )}

            {/* Evidence + disclaimer, HRT-page style */}
            <Reveal variant="fade">
              <div className="px-2">
                <p className="text-center text-xs font-medium text-brown/55">
                  {t("exhibition.story.disclaimer")}
                </p>
                <div className="mt-4 text-brown/50">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Sources
                  </p>
                  <ol className="mx-auto mt-3 max-w-md list-decimal space-y-1 pl-5 text-[11px] leading-relaxed">
                    {FACT_SOURCES.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 3 — The hormone hook */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk px-5 py-20 sm:py-24">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/30" />
          <div className="relative z-10 mx-auto max-w-xl text-center">
            <Reveal variant="rise">
              <h2 className="font-display text-3xl leading-tight text-cream drop-shadow-md sm:text-4xl">
                {t("exhibition.story.hormoneHook.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-cream/85">
                {t("exhibition.story.hormoneHook.body")}
              </p>
              {kiosk ? (
                <p className="mt-8 inline-block rounded-full bg-golden/20 px-7 py-3 text-sm font-semibold text-golden">
                  {t("exhibition.story.hormoneHook.cta")}
                </p>
              ) : (
                <a
                  href="https://joinmandi.com"
                  className="mt-8 inline-block rounded-full bg-golden px-7 py-3 text-sm font-semibold text-brown shadow-warm-lg transition-colors hover:bg-sun"
                >
                  {t("exhibition.story.hormoneHook.cta")} →
                </a>
              )}
            </Reveal>
          </div>
        </section>

        {/* 4 — Take it home: email capture */}
        <section className="relative bg-cream px-5 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-mandi-gradient-soft opacity-30" />
          <div className="relative mx-auto max-w-xl">
            <Reveal variant="rise">
              <div className="rounded-4xl bg-cream-soft p-8 shadow-warm-xl sm:p-12">
                <h2 className="mb-3 text-center font-display text-2xl leading-tight text-brown sm:text-3xl">
                  {t("exhibition.email.title")}
                </h2>
                <p className="mb-7 text-center text-sm leading-relaxed text-brown/80 sm:text-base">
                  {t("exhibition.email.body")}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submitEmail();
                  }}
                  className="flex flex-col gap-5"
                >
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("exhibition.email.placeholder")}
                    className="w-full rounded-2xl border-2 border-coral/30 bg-white px-5 py-4 text-brown
                      placeholder:text-brown/40 focus:border-terra focus:outline-none"
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
                      className="w-full rounded-2xl border-2 border-coral/30 bg-white px-5 py-4 text-brown
                        placeholder:text-brown/40 focus:border-terra focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-brown/60">
                      {t("exhibition.capture.age")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AGE_BANDS.map((band) => {
                        const selected = ageBand === band;
                        return (
                          <button
                            key={band}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setAgeBand(selected ? null : band)}
                            className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition-colors ${
                              selected
                                ? "border-brown bg-brown text-cream"
                                : "border-brown/20 bg-transparent text-brown/70 hover:border-brown/50"
                            }`}
                          >
                            {t(`exhibition.capture.ages.${band}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <ConsentCheckbox
                    label={t("exhibition.email.consent")}
                    checked={emailConsent}
                    onChange={setEmailConsent}
                    required
                  />
                  {/* Separate, explicit, unticked — never bundled with consent. */}
                  <ConsentCheckbox
                    label={t("exhibition.capture.marketing")}
                    checked={marketingOptIn}
                    onChange={setMarketingOptIn}
                  />
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={!email || !emailConsent || sending}
                    className="w-full"
                  >
                    {sending ? "…" : `${t("exhibition.email.cta")} →`}
                  </Button>
                  <p className="text-center text-xs leading-relaxed text-brown/50">
                    {t("exhibition.capture.finePrint")}
                  </p>
                </form>
                <button
                  onClick={() => setStep("thanks")}
                  className="mx-auto mt-4 block text-sm font-medium text-brown/55 hover:text-terra"
                >
                  {t("exhibition.email.skip")}
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Golden-patch affirmation — Q46 is the last question, so the toast
            fires as the story opens; render it here so it isn't lost. */}
        {affirmation && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brown px-5 py-3 text-sm font-medium text-cream shadow-warm-xl animate-rise-in">
            <span className="text-golden">✦</span> {affirmation}
          </div>
        )}
      </main>
    );
  }

  // thanks
  return (
    <main className="relative min-h-screen overflow-hidden bg-mandi-gradient-dusk">
      {restartChip}
      <AmbientBlobs intensity="soft" />
      <div className="pointer-events-none absolute inset-0 bg-brown/30" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="max-w-2xl font-display text-4xl leading-tight text-cream drop-shadow-md sm:text-5xl">
            {t("exhibition.thanks.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-cream/85">
            {kiosk ? t("exhibition.thanks.bodyKiosk") : t("exhibition.thanks.bodyPhone")}
          </p>
          {!kiosk && (
            <Link
              href="/language"
              className="mt-8 inline-block rounded-full bg-terra px-9 py-3.5 text-sm font-semibold text-cream shadow-warm-lg hover:bg-terra-dark transition-colors"
            >
              {t("exhibition.thanks.fullCta")} →
            </Link>
          )}
        </motion.div>
      </div>
    </main>
  );
}
