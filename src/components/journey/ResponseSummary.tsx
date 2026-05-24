"use client";

/**
 * Phase 21 — her questionnaire response summary on /my-journey.
 *
 * Shows: MenoScore, score band, top symptom domains, completed date.
 * Deliberately does NOT show persona (per user direction — kept
 * internal for admin segmentation; no clear UX benefit to surfacing
 * the bucket name to her).
 */

import Link from "next/link";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import type { QuestionnaireResponseRow, ScoreBand } from "@/lib/types/database";

interface Props {
  latest: QuestionnaireResponseRow | null;
}

const BAND_PILL: Record<ScoreBand, string> = {
  mild: "bg-golden/25 text-brown",
  moderate: "bg-coral/25 text-terra",
  significant: "bg-terra text-cream",
};

const BAND_RING: Record<ScoreBand, string> = {
  mild: "ring-golden/40 bg-golden/10 text-golden",
  moderate: "ring-coral/40 bg-coral/10 text-coral",
  significant: "ring-terra/40 bg-terra/10 text-terra",
};

export default function ResponseSummary({ latest }: Props) {
  const { t } = useTranslation("common");

  if (!latest) {
    return (
      <section className="bg-cream-soft rounded-3xl shadow-warm p-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
          {t("journey.summary.emptyEyebrow")}
        </p>
        <h2 className="font-display text-2xl text-brown mb-3">
          {t("journey.summary.emptyTitle")}
        </h2>
        <p className="text-brown/70 text-sm mb-5 max-w-xl">
          {t("journey.summary.emptyBody")}
        </p>
        <Link href="/questionnaire">
          <Button variant="primary">{t("journey.summary.emptyCta")} →</Button>
        </Link>
      </section>
    );
  }

  const band = latest.score_band;
  const score = latest.meno_score ?? 0;
  const topDomains = latest.top_domains ?? [];

  return (
    <section className="bg-cream-soft rounded-3xl shadow-warm p-7 sm:p-9">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
        {t("journey.summary.eyebrow")}
      </p>
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
        <div
          className={`flex flex-col items-center justify-center px-7 py-5 rounded-3xl ring-2 min-w-[160px] ${
            band ? BAND_RING[band] : "ring-cream-deep bg-cream text-brown"
          }`}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-brown/60 font-semibold mb-1">
            {t("journey.summary.menoScore")}
          </p>
          <p className="font-display text-6xl leading-none">{score}</p>
          <p className="text-xs text-brown/50 mt-1">
            {t("journey.summary.outOf")}
          </p>
          {band && (
            <span
              className={`mt-3 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full ${BAND_PILL[band]}`}
            >
              {t(`journey.summary.band.${band}`)}
            </span>
          )}
        </div>
        <div className="flex-1">
          {topDomains.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-2">
                {t("journey.summary.topAreasLabel")}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {topDomains.map((d) => (
                  <span
                    key={d}
                    className="text-xs bg-cream-deep/50 text-brown/85 px-3 py-1 rounded-full font-medium"
                  >
                    {t(`journey.summary.domain.${d}`, d)}
                  </span>
                ))}
              </div>
            </>
          )}
          <p className="text-brown/65 text-sm">
            {t("journey.summary.basedOn", {
              date: new Date(latest.completed_at).toLocaleDateString(),
            })}
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Link href="/roadmap">
              <Button variant="primary" size="sm">
                {t("journey.summary.viewRoadmap")}
              </Button>
            </Link>
            <Link href="/questionnaire">
              <Button variant="secondary" size="sm">
                {t("journey.summary.retake")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
