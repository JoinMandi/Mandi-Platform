"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Quilt from "@/components/ui/Quilt";
import { questions, type Question } from "@/lib/domain/questions";
import { buildQuilt } from "@/lib/domain/quilt";
import { calculateScore, domainScores } from "@/lib/domain/scoring";
import type { ScoreBand } from "@/lib/types/database";

interface StoredScore {
  menoScore: number;
  scoreBand: ScoreBand;
  selfHarmFlag?: boolean;
}

function formatAnswer(q: Question, value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (value === "__na__") return "Not applicable";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") {
    if (q.type === "scale" || q.type === "scale-optional") {
      return ["Not at all", "A little", "Quite a bit", "Extremely"][value] ?? String(value);
    }
    return String(value);
  }
  if (typeof value === "object" && value !== null && "value" in value && "unit" in value) {
    const m = value as { value: number; unit: string };
    return `${m.value} ${m.unit}`;
  }
  return String(value);
}

export default function SummaryPage() {
  const { t } = useTranslation("common");
  const [answers, setAnswers] = useState<Record<number, unknown> | null>(null);
  const [previousAnswers, setPreviousAnswers] = useState<Record<number, unknown> | null>(null);
  const [stored, setStored] = useState<StoredScore | null>(null);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setLang(new URLSearchParams(window.location.search).get("lang") ?? "en");
    try {
      const rawAnswers = localStorage.getItem("mandi-answers");
      if (rawAnswers) setAnswers(JSON.parse(rawAnswers) as Record<number, unknown>);
      const rawScore = localStorage.getItem("mandi-score");
      if (rawScore) setStored(JSON.parse(rawScore) as StoredScore);
      const rawPrevious = localStorage.getItem("mandi-previous-answers");
      if (rawPrevious) {
        setPreviousAnswers(JSON.parse(rawPrevious) as Record<number, unknown>);
      }
    } catch {
      /* leave the page in its empty state */
    }
  }, []);

  const score = useMemo(() => {
    if (stored) return stored;
    return answers ? calculateScore(answers) : null;
  }, [answers, stored]);

  const patches = useMemo(
    () =>
      answers
        ? buildQuilt(
            questions.filter((q) => !q.skipCondition || !q.skipCondition(answers)),
            answers,
            previousAnswers,
          )
        : [],
    [answers, previousAnswers],
  );

  const domains = useMemo(
    () =>
      answers
        ? domainScores(answers)
            .filter((d) => d.total > 0)
            .slice(0, 3)
        : [],
    [answers],
  );

  const visible = useMemo(
    () =>
      answers
        ? questions.filter((q) => !q.skipCondition || !q.skipCondition(answers))
        : [],
    [answers],
  );

  const date = new Date().toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!answers || !score) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl text-brown mb-3">
            Your results are still on this device.
          </p>
          <Link href="/questionnaire" className="link-warm text-terra text-sm">
            Start the questionnaire →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white text-brown">
      <div className="mx-auto max-w-3xl px-8 py-10 print:px-0 print:py-0">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link href="/roadmap" className="link-warm text-sm text-terra">
            ← Back to my results
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-terra px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Print / save as PDF
          </button>
        </div>

        <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
          Mandi · staging.joinmandi.co.za · joinmandi.com
        </p>
        <p className="mt-1 text-xs text-brown/50">
          PDF language: {lang.toUpperCase()} · {date}
        </p>

        {/* Page 1 — blanket and score */}
        <section className="mt-8">
          <h1 className="font-display text-4xl text-brown">My Mandi blanket</h1>
          <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
            <div className="sm:w-1/2">
              <Quilt patches={patches} answered={patches.length} variant="full" reveal />
            </div>
            <div className="sm:w-1/2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brown/50 font-semibold">
                MenoScore
              </p>
              <p className="font-display text-6xl text-terra leading-none">
                {score.menoScore}
              </p>
              <p className="mt-2 text-sm font-semibold text-brown">
                {t(`roadmap.band.${score.scoreBand}.label`)}
              </p>
              <p className="mt-2 text-sm text-brown/70">
                Not a diagnosis. A good place to start a conversation.
              </p>
              <p className="mt-5 text-[11px] uppercase tracking-[0.2em] text-brown/50 font-semibold">
                Where it presses hardest
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {domains.map((d) => (
                  <li key={d.domain} className="flex justify-between gap-3">
                    <span>{t(`questionnaire.domain.${d.domain}.title`)}</span>
                    <span className="font-semibold text-terra">{d.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-xs text-brown/60">
            One patch for every answer. Darker patches are where symptoms weigh
            more. When you answer again, patches that improve turn golden.
          </p>
        </section>

        {/* Page 2 — for the doctor */}
        <section className="mt-12 print:break-before-page">
          <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
            For your doctor
          </p>
          <h2 className="mt-1 font-display text-3xl text-brown">
            Summary for my doctor
          </h2>
          <p className="mt-2 text-sm text-brown/70">
            Prepared with Mandi&apos;s 56-question menopause check-in on {date}.
            Self-reported; not a diagnosis.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <p>
              <span className="font-semibold">MenoScore {score.menoScore}</span>
              {" · "}
              {t(`roadmap.band.${score.scoreBand}.label`)}
            </p>
            <p>
              <span className="font-semibold">Hardest areas: </span>
              {domains
                .map((d) => `${t(`questionnaire.domain.${d.domain}.title`)} ${d.percent}%`)
                .join(", ")}
            </p>
            <p className="text-brown/70">
              Full answers are listed on the last page.
            </p>
          </div>
        </section>

        {/* Page 3 — guidance */}
        <section id="guidance" className="mt-12 print:break-before-page">
          <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
            Guidance
          </p>
          <h2 className="mt-1 font-display text-3xl text-brown">
            My conversation with my doctor
          </h2>
          <p className="mt-2 text-sm text-brown/70">
            You and your doctor want the same thing: for you to feel like yourself
            again. These notes help you make the most of your time together.
          </p>

          <h3 className="mt-6 font-display text-lg text-brown">Before you go</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brown/80">
            <li>This PDF, printed or on your phone</li>
            <li>Your medicines and supplements, or photos of the boxes</li>
            <li>The date of your last period, roughly is fine</li>
            <li>The age your mother reached menopause, if you can ask her</li>
          </ul>

          <h3 className="mt-6 font-display text-lg text-brown">
            Three things to say out loud
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brown/80">
            <li>What I think is going on</li>
            <li>How I would like us to treat it, together</li>
            <li>What matters most to me right now</li>
          </ul>

          <h3 className="mt-6 font-display text-lg text-brown">
            Questions you can ask
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-brown/80">
            <li>Could this be hormonal, even if a blood test was normal?</li>
            <li>What are my options, with and without HRT?</li>
            <li>What are the benefits and risks for someone like me?</li>
            <li>When should we check how it is going?</li>
            <li>Can you help me claim from my medical aid? Is there a form?</li>
          </ul>

          <div className="mt-6 rounded-2xl border-l-4 border-terra bg-cream-soft p-4 text-sm">
            <p className="font-semibold">If it does not feel right</p>
            <p className="mt-1 text-brown/75">
              Feeling rushed? “This matters to me. Can we look at the whole
              picture?” Told it is just your age? “It is affecting my life. What
              can we do?” You can always ask for a second opinion.
            </p>
          </div>
        </section>

        {/* Page 4 — all answers */}
        <section className="mt-12 print:break-before-page">
          <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
            All 56 answers
          </p>
          <h2 className="mt-1 font-display text-3xl text-brown">What I shared</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {visible.map((q) => (
              <div key={q.id} className="border-b border-cream-deep/50 pb-2">
                <dt className="text-brown/70">
                  {q.id}. {t(`questionnaire.${q.textKey}`)}
                </dt>
                <dd className="font-medium text-brown">
                  {formatAnswer(q, answers[q.id])}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-10 text-xs text-brown/50">
          Mandi is not a diagnosis or a substitute for medical care. If you are in
          danger, call 112. SADAG: 0800 567 567.
        </p>
      </div>
    </main>
  );
}
