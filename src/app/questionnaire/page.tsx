"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  questions,
  type Question,
  type QuestionDomain,
} from "@/lib/domain/questions";
import { calculateScore } from "@/lib/domain/scoring";
import { submitQuestionnaire } from "@/server/actions/questionnaire";
import QuestionScreen from "@/components/ui/QuestionScreen";
import ScaleInput from "@/components/ui/ScaleInput";
import DomainTransition from "@/components/ui/DomainTransition";
import TransitionScreen from "@/components/ui/TransitionScreen";
import Button from "@/components/ui/Button";

const NA_SENTINEL = "__na__";

type MeasurementAnswer = { value: number; unit: string };

function isMeasurement(v: unknown): v is MeasurementAnswer {
  return !!v && typeof v === "object" && "value" in v && "unit" in v;
}

async function persistResponse(
  answers: Record<number, unknown>,
  result: ReturnType<typeof calculateScore>,
) {
  try {
    await submitQuestionnaire({
      answers: answers as Record<string, unknown>,
      menoScore: result.menoScore,
      scoreBand: result.scoreBand,
      persona: result.persona,
      selfHarmFlag: result.selfHarmFlag,
      colleenFlag: result.colleenFlag,
      topDomains: result.topDomains,
    });
  } catch {
    /* best-effort — localStorage copy is the source of truth for the roadmap */
  }
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [domainTransitionFrom, setDomainTransitionFrom] =
    useState<QuestionDomain | null>(null);
  const [showFinalTransition, setShowFinalTransition] = useState(false);

  const visibleQuestions = useMemo<Question[]>(
    () => questions.filter((q) => !q.skipCondition || !q.skipCondition(answers)),
    [answers],
  );

  const total = visibleQuestions.length;
  const current = visibleQuestions[currentIndex];
  const nextQuestion = visibleQuestions[currentIndex + 1];

  if (!current && !showFinalTransition) {
    return null;
  }

  const currentAnswer = current ? answers[current.id] : undefined;

  const setAnswer = (value: unknown) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const isAnswered = (() => {
    if (!current) return false;
    const v = currentAnswer;
    if (v === undefined || v === null) return false;
    if (current.type === "measurement") {
      return isMeasurement(v) && v.value > 0;
    }
    if (current.type === "multi-select") {
      return Array.isArray(v) && v.length > 0;
    }
    if (current.type === "scale-optional") {
      return typeof v === "number" || v === NA_SENTINEL;
    }
    return true;
  })();

  const goNext = () => {
    if (!current) return;
    // If this is the last visible question — show transition and route
    if (currentIndex >= total - 1) {
      const result = calculateScore(answers);
      if (typeof window !== "undefined") {
        localStorage.setItem("mandi-score", JSON.stringify(result));
        localStorage.setItem("mandi-answers", JSON.stringify(answers));
      }
      // Persist to Supabase for logged-in users (fire-and-forget)
      void persistResponse(answers, result);
      setShowFinalTransition(true);
      return;
    }

    // If next question is in a new domain — show domain transition first
    if (nextQuestion && nextQuestion.domain !== current.domain) {
      setDomainTransitionFrom(nextQuestion.domain);
      return;
    }

    setDirection(1);
    setCurrentIndex((i) => i + 1);
  };

  const goBack = () => {
    if (currentIndex === 0) return;
    setDirection(-1);
    setCurrentIndex((i) => i - 1);
  };

  const onDomainTransitionDone = () => {
    setDomainTransitionFrom(null);
    setDirection(1);
    setCurrentIndex((i) => i + 1);
  };

  const onFinalTransitionDone = () => {
    router.push("/roadmap");
  };

  // ── RENDER ────────────────────────────────────────────────

  if (showFinalTransition) {
    return <TransitionScreen onDone={onFinalTransitionDone} />;
  }

  return (
    <>
      <AnimatePresence>
        {domainTransitionFrom && (
          <DomainTransition
            key={`domain-${domainTransitionFrom}`}
            domain={domainTransitionFrom}
            onDone={onDomainTransitionDone}
          />
        )}
      </AnimatePresence>

      <QuestionScreen
        current={currentIndex + 1}
        total={total}
        domain={current.domain}
        onBack={goBack}
        showBack={currentIndex > 0}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, y: currentIndex === 0 ? 16 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: currentIndex === 0 ? 0.5 : 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-6"
          >
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

            {renderInput(
              current,
              currentAnswer,
              setAnswer,
              t,
            )}

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
            </div>
          </motion.div>
        </AnimatePresence>
      </QuestionScreen>
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
    // "none" is mutually exclusive with any other condition
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
