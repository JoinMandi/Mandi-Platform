"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Quilt from "./Quilt";
import { DOMAIN_ORDER, type QuestionDomain } from "@/lib/domain/questions";
import type { QuiltPatch } from "@/lib/domain/quilt";

interface DomainTransitionProps {
  /** The domain she is about to enter. */
  nextDomain: QuestionDomain;
  /** The domain band she just finished. */
  completedDomain: QuestionDomain;
  patches: QuiltPatch[];
  answeredCount: number;
  onDone: () => void;
  durationMs?: number;
}

export default function DomainTransition({
  nextDomain,
  completedDomain,
  patches,
  answeredCount,
  onDone,
  durationMs = 8000,
}: DomainTransitionProps) {
  const { t } = useTranslation("common");

  useEffect(() => {
    const timer = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timer);
  }, [onDone, durationMs]);

  const completedTitle = t(`questionnaire.domain.${completedDomain}.title`);
  const nextTitle = t(`questionnaire.domain.${nextDomain}.title`);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-mandi-gradient-soft px-5 py-10 animate-fade-in">
      <div className="pointer-events-none absolute inset-0 bg-cream/45" />

      <div className="relative z-10 w-full max-w-md animate-rise-in text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-terra">
          {t("questionnaire.bandComplete", { area: completedTitle })}
        </p>
        <h2 className="mt-1 font-display text-2xl text-brown">
          {t("questionnaire.bandHeadline")}
        </h2>

        <div className="mx-auto mt-6 rounded-4xl border border-cream-deep/60 bg-cream-soft/85 p-5 shadow-warm-lg backdrop-blur-sm">
          <Quilt
            patches={patches}
            answered={answeredCount}
            variant="full"
            highlightDomain={DOMAIN_ORDER.indexOf(completedDomain)}
            className="mx-auto"
          />
        </div>

        {/* Did you know? */}
        <div className="mx-auto mt-6 rounded-3xl border-l-4 border-golden bg-cream-soft p-5 text-left shadow-warm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-terra">
            {t("questionnaire.didYouKnow")}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-brown/85">
            {t(`questionnaire.facts.${nextDomain}`)}
          </p>
        </div>

        <p className="mt-6 text-sm text-brown/65">
          {t("questionnaire.nextArea", { area: nextTitle })}
        </p>

        <button
          type="button"
          onClick={onDone}
          className="mt-5 rounded-full bg-terra px-10 py-3.5 text-sm font-semibold text-cream shadow-warm-lg transition-colors hover:bg-terra-dark"
        >
          {t("questionnaire.continue")} →
        </button>
      </div>
    </div>
  );
}
