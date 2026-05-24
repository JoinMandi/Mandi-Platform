"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ProgressBar from "./ProgressBar";
import Quilt from "./Quilt";
import { DOMAIN_ORDER, type QuestionDomain } from "@/lib/domain/questions";
import type { QuiltPatch } from "@/lib/domain/quilt";

interface QuestionScreenProps {
  current: number;
  total: number;
  domain: QuestionDomain;
  onBack?: () => void;
  showBack: boolean;
  children: React.ReactNode;
  patches: QuiltPatch[];
  answeredCount: number;
  onQuiltTap: () => void;
}

export default function QuestionScreen({
  current,
  total,
  domain,
  onBack,
  showBack,
  children,
  patches,
  answeredCount,
  onQuiltTap,
}: QuestionScreenProps) {
  const { t } = useTranslation("common");
  const domainNumber = DOMAIN_ORDER.indexOf(domain) + 1;

  return (
    <div className="relative min-h-screen bg-cream overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mandi-gradient-soft opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-cream/60" />

      <ProgressBar variant="top" current={current} total={total} />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col min-h-screen px-5 pt-6 pb-10">
        {/* The growing blanket */}
        <button
          type="button"
          onClick={onQuiltTap}
          className="group block w-full rounded-3xl border border-cream-deep/60 bg-cream-soft/80 p-3 shadow-warm
            backdrop-blur-sm transition-transform hover:-translate-y-0.5"
          aria-label={t("questionnaire.quiltHeading")}
        >
          <Quilt patches={patches} answered={answeredCount} variant="compact" className="mx-auto" />
          <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brown/55">
            {t("questionnaire.patchesStitched", { done: answeredCount, total })}
          </p>
        </button>

        {/* Header row: back + progress counter */}
        <div className="flex items-center justify-between mt-5 mb-5">
          {showBack ? (
            <button
              onClick={onBack}
              type="button"
              className="flex items-center gap-1.5 text-sm text-brown/60 hover:text-terra transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t("questionnaire.back")}
            </button>
          ) : (
            <span />
          )}
          <span className="text-[11px] uppercase tracking-[0.18em] text-brown/45 font-semibold">
            {t("questionnaire.progress", { current, total })}
          </span>
        </div>

        {/* Domain label */}
        <motion.p
          key={`domain-${domain}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold text-center mb-3"
        >
          {t("questionnaire.areaProgress", { current: domainNumber, total: DOMAIN_ORDER.length })}
          {" · "}
          {t(`questionnaire.domain.${domain}.title`)}
        </motion.p>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center gap-8">{children}</div>

        {current === 1 && (
          <p className="text-center text-xs text-brown/45 mt-6 font-medium">
            {t("questionnaire.time")}
          </p>
        )}
      </div>
    </div>
  );
}
