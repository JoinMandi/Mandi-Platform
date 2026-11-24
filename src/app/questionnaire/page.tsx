"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  questions,
  type Question,
  type QuestionDomain,
} from "@/lib/domain/questions";
import { calculateScore } from "@/lib/domain/scoring";
import { buildQuilt } from "@/lib/domain/quilt";
import { submitQuestionnaire } from "@/server/actions/questionnaire";
import {
  completeRun,
  loadRun,
  saveRunAnswer,
  startRun,
} from "@/server/actions/questionnaire-run";
import { logEngagement } from "@/server/actions/engagement";
import { loadProgress, saveProgress, clearProgress } from "@/lib/questionnaire-progress";
import QuestionScreen from "@/components/ui/QuestionScreen";
import ScaleInput from "@/components/ui/ScaleInput";
import DomainTransition from "@/components/ui/DomainTransition";
import TransitionScreen from "@/components/ui/TransitionScreen";
import Quilt from "@/components/ui/Quilt";
import Button from "@/components/ui/Button";

const NA_SENTINEL = "__na__";

const SINGLE_SELECT = new Set<string>([
  "scale",
  "scale-optional",
  "multiple-choice",
  "select",
  "yes-no",
  "yes-no-notsure",
]);

type MeasurementAnswer = { value: number; unit: string };

function isMeasurement(v: unknown): v is MeasurementAnswer {
  return !!v && typeof v === "object" && "value" in v && "unit" in v;
}

function isAnsweredFor(q: Question, v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (q.type === "measurement") return isMeasurement(v) && v.value > 0;
  if (q.type === "multi-select") return Array.isArray(v) && v.length > 0;
  if (q.type === "scale-optional") return typeof v === "number" || v === NA_SENTINEL;
  if (q.type === "scale") return typeof v === "number";
  if (q.type === "number") return typeof v === "number" && v > 0;
  return true;
}

async function persistResponse(
  answers: Record<number, unknown>,
  responseId: string,
) {
  try {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("mandi-session") : null;
    await submitQuestionnaire({
      answers: answers as Record<string, unknown>,
      responseId,
      sessionId,
    });
  } catch {
    /* best-effort — localStorage copy is the source of truth for the roadmap */
  }
}

type Phase = "loading" | "welcome" | "resume" | "question" | "safety" | "final";

/** Funnel analytics: fire-and-forget, no answers, no PII. */
function track(
  eventType: "questionnaire_start" | "questionnaire_domain" | "questionnaire_complete",
  targetId: string | null,
  meta?: Record<string, unknown>,
) {
  void logEngagement({
    eventType,
    targetId,
    sessionId: localStorage.getItem("mandi-session"),
    meta: { lang: localStorage.getItem("mandi-lang") ?? "en", ...meta },
  });
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [domainTransition, setDomainTransition] = useState<{
    completedDomain: QuestionDomain;
    nextDomain: QuestionDomain;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [affirmation, setAffirmation] = useState<string | null>(null);
  const savedRef = useRef<ReturnType<typeof loadProgress>>(null);
  // Stable id for this attempt: a retry reuses it, so the server insert is
  // idempotent. (shortcut: parity table PK; move to questionnaire_runs in Phase 1)
  const responseIdRef = useRef<string | null>(null);
  // Cross-device resume token (opaque bearer secret, no PII).
  const resumeTokenRef = useRef<string | null>(null);
  const [resumeToken, setResumeToken] = useState<string | null>(null);
  const [saveCopied, setSaveCopied] = useState(false);

  const visibleQuestions = useMemo<Question[]>(
    () => questions.filter((q) => !q.skipCondition || !q.skipCondition(answers)),
    [answers],
  );
  const patches = useMemo(() => buildQuilt(visibleQuestions), [visibleQuestions]);
  const goldenId = useMemo(() => patches.find((p) => p.isGolden)?.questionId, [patches]);

  const total = visibleQuestions.length;
  const current = visibleQuestions[Math.min(currentIndex, total - 1)];
  const nextQuestion = visibleQuestions[currentIndex + 1];
  const answeredCount = visibleQuestions.filter((q) => isAnsweredFor(q, answers[q.id])).length;

  const goNextRef = useRef<() => void>(() => {});
  const advanceTimer = useRef<number | undefined>(undefined);

  // ── Load saved progress on mount ─────────────────────────────
  useEffect(() => {
    if (!responseIdRef.current) responseIdRef.current = crypto.randomUUID();
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("resume");
      const storedToken = localStorage.getItem("mandi-resume-token");
      const token = urlToken ?? storedToken;

      if (token) {
        const remote = await loadRun(token);
        if (remote && Object.keys(remote.answers).length > 0) {
          const remoteAnswers = remote.answers as Record<number, unknown>;
          resumeTokenRef.current = token;
          setResumeToken(token);
          localStorage.setItem("mandi-resume-token", token);
          setAnswers(remoteAnswers);
          const visible = questions.filter(
            (q) => !q.skipCondition || !q.skipCondition(remoteAnswers),
          );
          const firstUnanswered = visible.findIndex(
            (q) => !isAnsweredFor(q, remoteAnswers[q.id]),
          );
          setCurrentIndex(
            firstUnanswered < 0
              ? Math.max(0, visible.length - 1)
              : firstUnanswered,
          );
          setPhase("question");
          track("questionnaire_start", "/questionnaire");
          return;
        }
      }

      const saved = loadProgress();
      savedRef.current = saved;
      setPhase(saved ? "resume" : "welcome");
      if (!saved) {
        track("questionnaire_start", "/questionnaire");
        void startRun()
          .then((newToken) => {
            if (!newToken) return;
            resumeTokenRef.current = newToken;
            localStorage.setItem("mandi-resume-token", newToken);
            setResumeToken(newToken);
          })
          .catch(() => {});
      }
    })();
    // Runs once; the remote/local resume decision is made from storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Creates the server run lazily if the mount call failed or was cleared. */
  const ensureRun = async (): Promise<string | null> => {
    if (resumeTokenRef.current) return resumeTokenRef.current;
    const token = await startRun().catch(() => null);
    if (token) {
      resumeTokenRef.current = token;
      localStorage.setItem("mandi-resume-token", token);
      setResumeToken(token);
    }
    return token;
  };

  // ── Persist progress while answering ─────────────────────────
  useEffect(() => {
    if (phase === "question") saveProgress(answers, currentIndex);
  }, [answers, currentIndex, phase]);

  // ── Affirmation toast auto-dismiss ───────────────────────────
  useEffect(() => {
    if (!affirmation) return;
    const timer = window.setTimeout(() => setAffirmation(null), 3600);
    return () => window.clearTimeout(timer);
  }, [affirmation]);

  const goNext = () => {
    window.clearTimeout(advanceTimer.current);
    const q = visibleQuestions[currentIndex];
    if (!q || !isAnsweredFor(q, answers[q.id])) return;

    if (currentIndex >= total - 1) {
      const result = calculateScore(answers);
      if (typeof window !== "undefined") {
        localStorage.setItem("mandi-score", JSON.stringify(result));
        localStorage.setItem("mandi-answers", JSON.stringify(answers));
      }
      clearProgress();
      const finishedToken = resumeTokenRef.current;
      resumeTokenRef.current = null;
      setResumeToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("mandi-resume-token");
      }
      if (finishedToken) void completeRun(finishedToken);
      const responseId = responseIdRef.current ?? crypto.randomUUID();
      responseIdRef.current = responseId;
      void persistResponse(answers, responseId);
      track("questionnaire_complete", "/questionnaire", { score_band: result.scoreBand });
      setPhase(result.selfHarmFlag ? "safety" : "final");
      return;
    }

    if (nextQuestion && nextQuestion.domain !== q.domain) {
      track("questionnaire_domain", q.domain);
      setDomainTransition({ completedDomain: q.domain, nextDomain: nextQuestion.domain });
      return;
    }

    setCurrentIndex((i) => i + 1);
  };
  goNextRef.current = goNext;

  const goBack = () => {
    window.clearTimeout(advanceTimer.current);
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  const setAnswer = (value: unknown) => {
    const q = visibleQuestions[currentIndex];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    void ensureRun().then((token) => {
      if (token) void saveRunAnswer(token, String(q.id), value);
    });
    if (q.id === goldenId) {
      const n = 1 + Math.floor(Math.random() * 4);
      setAffirmation(t(`questionnaire.affirmations.${n}`));
    }
    if (SINGLE_SELECT.has(q.type)) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goNextRef.current(), 430);
    }
  };

  const onDomainTransitionDone = () => {
    setDomainTransition(null);
    setCurrentIndex((i) => i + 1);
  };

  const currentAnswer = current ? answers[current.id] : undefined;
  const isAnswered = current ? isAnsweredFor(current, currentAnswer) : false;

  // ── Render ───────────────────────────────────────────────────
  if (phase === "loading") return null;

  if (phase === "welcome") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-mandi-gradient-soft flex items-center justify-center px-5 py-12">
        <div className="absolute inset-0 bg-cream/45" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-xl rounded-5xl border border-cream-deep/60 bg-cream-soft/95 p-8 sm:p-10 shadow-warm-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-terra font-semibold">
            {t("questionnaire.welcome.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-brown leading-tight">
            {t("questionnaire.welcome.title")}
          </h1>
          <p className="mt-3 text-sm text-brown/70 leading-relaxed">
            {t("questionnaire.welcome.sub")}
          </p>
          <p className="mt-4 text-sm text-brown/75 leading-relaxed">
            {t("questionnaire.welcome.body")}
          </p>
          <ul className="mt-5 space-y-2">
            {[
              "point1", "point2", "point3", "point4",
              "point5", "point6", "point7",
            ].map((key) => (
              <li key={key} className="flex gap-2 text-sm text-brown/70">
                <span className="text-golden">✦</span>
                <span>{t(`questionnaire.welcome.${key}`)}</span>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-7"
            onClick={() => setPhase("question")}
          >
            {t("questionnaire.welcome.cta")} →
          </Button>
        </motion.div>
      </main>
    );
  }

  if (phase === "resume") {
    const saved = savedRef.current;
    const count = saved ? Object.keys(saved.answers).length : 0;
    return (
      <main className="relative min-h-screen overflow-hidden bg-mandi-gradient-soft flex items-center justify-center px-5 py-12">
        <div className="absolute inset-0 bg-cream/45" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md rounded-5xl border border-cream-deep/60 bg-cream-soft/95 p-8 sm:p-10 text-center shadow-warm-xl"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-terra font-semibold">
            {t("landing.eyebrow").split("·")[0].trim()}
          </p>
          <h1 className="mt-3 font-display text-3xl text-brown">
            {t("questionnaire.resumeTitle")}
          </h1>
          <p className="mt-3 text-sm text-brown/70 leading-relaxed">
            {t("questionnaire.resumeBody", { progress: `${count} of ${total} patches` })}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-7"
            onClick={() => {
              if (saved) {
                setAnswers(saved.answers);
                setCurrentIndex(saved.currentIndex);
              }
              setPhase("question");
            }}
          >
            {t("questionnaire.resumeContinue")} →
          </Button>
          <button
            onClick={() => {
              clearProgress();
              responseIdRef.current = crypto.randomUUID();
              resumeTokenRef.current = null;
              setResumeToken(null);
              localStorage.removeItem("mandi-resume-token");
              setPhase("question");
              void startRun()
                .then((token) => {
                  if (!token) return;
                  resumeTokenRef.current = token;
                  localStorage.setItem("mandi-resume-token", token);
                  setResumeToken(token);
                })
                .catch(() => {});
            }}
            className="mt-3 text-sm font-medium text-brown/55 hover:text-terra"
          >
            {t("questionnaire.resumeFresh")}
          </button>
        </motion.div>
      </main>
    );
  }

  if (phase === "safety") {
    return (
      <main className="relative min-h-screen overflow-hidden bg-mandi-gradient flex items-center justify-center px-5 py-12">
        <div className="absolute inset-0 bg-brown/10" />
        <div className="relative z-10 w-full max-w-lg rounded-5xl border border-cream/30 bg-cream-soft/95 p-8 sm:p-10 text-center shadow-warm-xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold">
            {t("questionnaire.safety.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl text-brown leading-tight">
            {t("questionnaire.safety.title")}
          </h1>
          <p className="mt-3 text-sm text-brown/70 leading-relaxed">
            {t("questionnaire.safety.body")}
          </p>
          <div className="mt-6 rounded-3xl border-l-4 border-terra bg-white p-5 text-left shadow-warm">
            <p className="font-semibold text-brown">
              {t("questionnaire.safety.sadagLabel")}
            </p>
            <p className="mt-1 text-sm text-brown/70">
              {t("questionnaire.safety.sadagNote")}
            </p>
            <a
              href="tel:0800567567"
              className="mt-2 inline-block font-display text-2xl text-terra hover:text-terra-dark"
            >
              0800 567 567
            </a>
            <p className="mt-2 text-xs text-brown/60">
              {t("questionnaire.safety.emergency")}
            </p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-brown/60">
            {t("questionnaire.safety.note")}
          </p>
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={() => setPhase("final")}
          >
            {t("questionnaire.safety.cta")} →
          </Button>
        </div>
      </main>
    );
  }

  if (phase === "final") {
    return <TransitionScreen patches={patches} onDone={() => router.push("/roadmap")} />;
  }

  if (!current) return null;

  return (
    <>
      {/* Cross-device save: copy a bearer link she can open elsewhere. */}
      {resumeToken && (
        <button
          type="button"
          onClick={async () => {
            const link = `${window.location.origin}/questionnaire?resume=${resumeToken}`;
            try {
              await navigator.clipboard.writeText(link);
              setSaveCopied(true);
              window.setTimeout(() => setSaveCopied(false), 2500);
            } catch {
              /* clipboard unavailable — on-device resume still works */
            }
          }}
          className="fixed left-4 top-4 z-[60] rounded-full border border-brown/15 bg-cream-soft/90 px-4 py-2
            text-xs font-semibold text-brown/60 shadow-warm backdrop-blur-sm transition-colors
            hover:border-terra hover:text-terra"
        >
          {saveCopied ? t("questionnaire.saveLinkCopied") : t("questionnaire.saveLink")}
        </button>
      )}

      {/* Visible way out — saving is automatic, so exiting is always safe.
          Same chip recipe as the exhibition's start-over control. */}
      <button
        type="button"
        onClick={() => router.push("/")}
        className="fixed right-4 top-4 z-[60] rounded-full border border-brown/15 bg-cream-soft/90 px-4 py-2
          text-xs font-semibold text-brown/60 shadow-warm backdrop-blur-sm transition-colors
          hover:border-terra hover:text-terra"
      >
        {t("questionnaire.saveExit")}
      </button>

      {domainTransition && (
        <DomainTransition
          key={`domain-${domainTransition.nextDomain}`}
          completedDomain={domainTransition.completedDomain}
          nextDomain={domainTransition.nextDomain}
          patches={patches}
          answeredCount={answeredCount}
          onDone={onDomainTransitionDone}
        />
      )}

      <QuestionScreen
        current={currentIndex + 1}
        total={total}
        domain={current.domain}
        onBack={goBack}
        showBack={currentIndex > 0}
        patches={patches}
        answeredCount={answeredCount}
        onQuiltTap={() => setExpanded(true)}
      >
        <div key={current.id} className="flex flex-col gap-6 animate-rise-in">
            <div className="text-center">
              <h2 className="font-display text-2xl sm:text-3xl text-brown leading-tight px-2">
                {t(`questionnaire.${current.textKey}`)}
              </h2>
              {current.hintKey && (
                <p className="mt-3 text-sm text-brown/60 italic leading-relaxed max-w-md mx-auto">
                  {t(`questionnaire.${current.hintKey}`)}
                </p>
              )}
            </div>

            {renderInput(current, currentAnswer, setAnswer, t)}

            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={goNext}
                disabled={!isAnswered}
                className="w-full"
              >
                {currentIndex < total - 1 ? t("questionnaire.next") : t("questionnaire.finish")}
              </Button>
              <p className="text-center text-xs text-brown/50">
                {t("questionnaire.autosaveNote")}
              </p>
            </div>
        </div>
      </QuestionScreen>

      {/* Easter egg — expand the blanket */}
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
            <h3 className="mt-1 text-center font-display text-xl text-brown">
              {t("questionnaire.patchesStitched", { done: answeredCount, total }).split("·")[0].trim()}
            </h3>
            <div className="mt-5">
              <Quilt patches={patches} answered={answeredCount} variant="full" className="mx-auto" />
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

      {/* Easter egg — golden patch affirmation */}
      {affirmation && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brown px-5 py-3 text-sm font-medium text-cream shadow-warm-xl animate-rise-in">
          <span className="text-golden">✦</span> {affirmation}
        </div>
      )}
    </>
  );
}

// ── INPUT RENDERERS ──────────────────────────────────────────

type TranslateFn = (key: string) => string;

function renderInput(
  q: Question,
  answer: unknown,
  setAnswer: (v: unknown) => void,
  t: TranslateFn,
) {
  switch (q.type) {
    case "scale":
      return (
        <ScaleInput
          value={typeof answer === "number" ? answer : null}
          onChange={setAnswer}
        />
      );
    case "scale-optional":
      return (
        <ScaleInput
          value={typeof answer === "number" ? answer : null}
          onChange={setAnswer}
          allowNotApplicable
          notApplicableSelected={answer === NA_SENTINEL}
          onNotApplicable={() => setAnswer(NA_SENTINEL)}
        />
      );
    case "multiple-choice":
      return <Choices q={q} answer={answer} setAnswer={setAnswer} t={t} />;
    case "select":
      return <Choices q={q} answer={answer} setAnswer={setAnswer} t={t} />;
    case "multi-select":
      return <MultiChoice q={q} answer={answer} setAnswer={setAnswer} t={t} />;
    case "yes-no":
      return <YesNo answer={answer} setAnswer={setAnswer} t={t} withNotSure={false} />;
    case "yes-no-notsure":
      return <YesNo answer={answer} setAnswer={setAnswer} t={t} withNotSure />;
    case "number":
      return (
        <div className="max-w-xs mx-auto w-full">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            placeholder={t(`questionnaire.${q.textKey.split(".")[0]}.placeholder`)}
            value={typeof answer === "number" ? answer : ""}
            onChange={(e) => setAnswer(Number(e.target.value))}
            className="w-full text-center font-display text-3xl py-4 bg-cream-soft border-2 border-coral/30
              rounded-2xl text-brown focus:border-terra shadow-warm"
          />
        </div>
      );
    case "measurement":
      return <Measurement q={q} answer={answer} setAnswer={setAnswer} t={t} />;
    default:
      return null;
  }
}

function Choices({
  q,
  answer,
  setAnswer,
  t,
}: {
  q: Question;
  answer: unknown;
  setAnswer: (v: unknown) => void;
  t: TranslateFn;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {q.options?.map((opt) => {
        const selected = answer === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => setAnswer(opt.value)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.99 }}
            className={`text-left px-5 py-4 rounded-2xl border-2 text-sm sm:text-base font-medium
              transition-colors
              ${selected
                ? "bg-terra text-cream border-terra shadow-warm"
                : "bg-cream-soft border-coral/25 text-brown hover:border-terra hover:bg-coral/5"}`}
          >
            {t(`questionnaire.${opt.labelKey}`)}
          </motion.button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  q,
  answer,
  setAnswer,
  t,
}: {
  q: Question;
  answer: unknown;
  setAnswer: (v: unknown) => void;
  t: TranslateFn;
}) {
  const selectedArr: string[] = Array.isArray(answer) ? (answer as string[]) : [];

  const toggle = (value: string) => {
    if (value === "none" || value === "not-sure") {
      setAnswer(selectedArr.includes(value) ? [] : [value]);
      return;
    }
    const withoutExclusives = selectedArr.filter((v) => v !== "none" && v !== "not-sure");
    if (withoutExclusives.includes(value)) {
      setAnswer(withoutExclusives.filter((v) => v !== value));
    } else {
      setAnswer([...withoutExclusives, value]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs text-brown/55 text-center italic">
        {t("questionnaire.multiSelectHint")}
      </p>
      {q.options?.map((opt) => {
        const selected = selectedArr.includes(opt.value);
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.99 }}
            className={`flex items-center gap-3 text-left px-5 py-3.5 rounded-2xl border-2 text-sm
              font-medium transition-colors
              ${selected
                ? "bg-terra text-cream border-terra shadow-warm"
                : "bg-cream-soft border-coral/25 text-brown hover:border-terra"}`}
          >
            <span
              className={`w-5 h-5 rounded-md flex-shrink-0 border-2 flex items-center justify-center
                ${selected ? "bg-cream border-cream" : "bg-transparent border-terra/50"}`}
            >
              {selected && (
                <svg className="w-3 h-3 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            {t(`questionnaire.${opt.labelKey}`)}
          </motion.button>
        );
      })}
    </div>
  );
}

function YesNo({
  answer,
  setAnswer,
  t,
  withNotSure,
}: {
  answer: unknown;
  setAnswer: (v: unknown) => void;
  t: TranslateFn;
  withNotSure: boolean;
}) {
  const opts = withNotSure
    ? [
        { v: "yes", label: t("questionnaire.yes") },
        { v: "no", label: t("questionnaire.no") },
        { v: "not-sure", label: t("questionnaire.notSure") },
      ]
    : [
        { v: "yes", label: t("questionnaire.yes") },
        { v: "no", label: t("questionnaire.no") },
      ];

  return (
    <div className={`grid ${withNotSure ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
      {opts.map(({ v, label }) => {
        const selected = answer === v;
        return (
          <motion.button
            key={v}
            type="button"
            onClick={() => setAnswer(v)}
            animate={{ scale: selected ? 1.04 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            whileTap={{ scale: 0.97 }}
            className={`py-5 rounded-2xl border-2 font-semibold text-base capitalize
              ${selected
                ? "bg-terra text-cream border-terra shadow-warm-lg"
                : "bg-cream-soft border-coral/30 text-brown hover:border-terra"}`}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
}

function Measurement({
  q,
  answer,
  setAnswer,
  t,
}: {
  q: Question;
  answer: unknown;
  setAnswer: (v: unknown) => void;
  t: TranslateFn;
}) {
  const meas = isMeasurement(answer) ? answer : { value: 0, unit: q.units?.[0]?.value ?? "" };
  const setValue = (n: number) => setAnswer({ ...meas, value: n });
  const setUnit = (u: string) => setAnswer({ ...meas, unit: u });

  return (
    <div className="max-w-sm mx-auto w-full flex flex-col gap-3">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={meas.value || ""}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full text-center font-display text-3xl py-4 bg-cream-soft border-2 border-coral/30
          rounded-2xl text-brown focus:border-terra shadow-warm"
      />
      <div className="flex gap-2 justify-center">
        {q.units?.map((u) => {
          const selected = meas.unit === u.value;
          return (
            <button
              key={u.value}
              type="button"
              onClick={() => setUnit(u.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border
                ${selected
                  ? "bg-terra text-cream border-terra"
                  : "bg-transparent text-brown/60 border-brown/20 hover:border-terra"}`}
            >
              {t(u.labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
