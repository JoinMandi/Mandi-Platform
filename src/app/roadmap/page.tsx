"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import CountUp from "@/components/ui/CountUp";
import Quilt from "@/components/ui/Quilt";
import { questions } from "@/lib/domain/questions";
import { buildQuilt } from "@/lib/domain/quilt";
import type { ScoreBand, Persona, RoadmapSlot } from "@/lib/domain/scoring";

interface RoadmapData {
  menoScore: number;
  scoreBand: ScoreBand;
  persona: Persona;
  roadmapOrder: RoadmapSlot[];
  selfHarmFlag: boolean;
  colleenFlag: boolean;
  topDomains?: string[];
}

// Section accent colour per slot (matches brief — different brand colour per card)
const SLOT_ACCENT: Record<RoadmapSlot, string> = {
  "book-first":       "border-terra",
  "download-first":   "border-brown",
  "education-first":  "border-golden",
  "options-first":    "border-coral",
  "normalise-first":  "border-pink-mandi",
  "clinic-first":     "border-sun",
};

const SLOT_HREFS: Record<RoadmapSlot, string> = {
  "book-first":      "/find-a-doctor",
  "download-first":  "/my-journey#download",
  "education-first": "/truth-about-hrt",
  "options-first":   "/resources",
  "normalise-first": "/honour-the-mothers",
  "clinic-first":    "/find-a-doctor",
};

const BAND_COLOR: Record<ScoreBand, { fg: string; bg: string; ring: string }> = {
  mild:        { fg: "text-golden", bg: "bg-golden/15", ring: "ring-golden/30" },
  moderate:    { fg: "text-coral",  bg: "bg-coral/15",  ring: "ring-coral/30" },
  significant: { fg: "text-terra",  bg: "bg-terra/15",  ring: "ring-terra/30" },
};

export default function RoadmapPage() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [data, setData] = useState<RoadmapData | null>(null);
  const [answers, setAnswers] = useState<Record<number, unknown> | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("mandi-score") : null;
    if (!stored) {
      router.replace("/questionnaire");
      return;
    }
    try {
      setData(JSON.parse(stored) as RoadmapData);
    } catch {
      router.replace("/questionnaire");
      return;
    }
    const storedAnswers = localStorage.getItem("mandi-answers");
    if (storedAnswers) {
      try {
        setAnswers(JSON.parse(storedAnswers) as Record<number, unknown>);
      } catch {
        /* the quilt motif is optional — skip it if answers are unreadable */
      }
    }
  }, [router]);

  const patches = useMemo(() => {
    if (!answers) return [];
    const visible = questions.filter(
      (q) => !q.skipCondition || !q.skipCondition(answers),
    );
    return buildQuilt(visible);
  }, [answers]);

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-brown/50 text-sm">…</p>
        </main>
      </>
    );
  }

  const band = BAND_COLOR[data.scoreBand];
  const steps = data.roadmapOrder.slice(0, 4);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero — warm gradient backdrop */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <div className="absolute inset-0 bg-brown/20" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-cream/80 text-xs uppercase tracking-[0.25em] font-semibold mb-4"
            >
              {t("roadmap.title")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display text-4xl sm:text-5xl text-cream leading-tight"
            >
              {t(`roadmap.persona.${data.persona}.headline`)}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-5 text-cream/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            >
              {t(`roadmap.persona.${data.persona}.body`)}
            </motion.p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
          {/* MenoScore card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-stretch">
              <div className={`flex flex-col items-center justify-center px-8 py-6 rounded-3xl ring-2 ${band.ring} ${band.bg} min-w-[180px]`}>
                <p className="text-[11px] uppercase tracking-[0.2em] text-brown/60 font-semibold mb-1">
                  {t("roadmap.menoScore")}
                </p>
                <p className={`font-display text-7xl ${band.fg} leading-none`}>
                  <CountUp to={data.menoScore} />
                </p>
                <p className="text-xs text-brown/50 mt-1">{t("roadmap.outOf")}</p>
                <p className={`mt-3 text-sm font-semibold ${band.fg}`}>
                  {t(`roadmap.band.${data.scoreBand}.label`)}
                </p>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-brown/80 text-base leading-relaxed">
                  {t(`roadmap.band.${data.scoreBand}.line`)}
                </p>
              </div>
            </div>
          </motion.div>

          {/* The blanket she stitched */}
          {patches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 bg-cream-soft rounded-4xl shadow-warm p-7 sm:p-9 text-center"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
                {t("roadmap.blanketLabel")}
              </p>
              <div className="mt-5">
                <Quilt
                  patches={patches}
                  answered={patches.length}
                  variant="full"
                  reveal
                  className="mx-auto"
                />
              </div>
              <p className="mt-5 text-sm text-brown/65 max-w-sm mx-auto leading-relaxed">
                {t("roadmap.blanketCaption")}
              </p>
            </motion.div>
          )}

          {/* Safety flags */}
          {data.selfHarmFlag && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-6 bg-brown text-cream rounded-3xl px-7 py-6 shadow-warm-lg"
            >
              <p className="font-display text-lg mb-2">{t("roadmap.safety.selfHarm.title")}</p>
              <p className="text-cream/90 text-sm leading-relaxed mb-4">
                {t("roadmap.safety.selfHarm.body")}
              </p>
              <a
                href={t("roadmap.safety.selfHarm.sadagLink")}
                className="inline-flex items-center gap-2 px-5 py-3 bg-cream text-brown rounded-full font-semibold text-sm hover:bg-golden transition-colors"
              >
                📞 {t("roadmap.safety.selfHarm.sadag")}
              </a>
            </motion.div>
          )}

          {data.colleenFlag && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-6 bg-golden/20 border border-golden/40 rounded-3xl px-7 py-5 shadow-warm"
            >
              <p className="font-semibold text-brown mb-1">{t("roadmap.safety.colleen.title")}</p>
              <p className="text-brown/80 text-sm leading-relaxed">
                {t("roadmap.safety.colleen.body")}
              </p>
            </motion.div>
          )}

          {/* Roadmap steps */}
          <section className="mt-10 mb-16">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="font-display text-xl sm:text-2xl text-brown mb-5"
            >
              Your next steps
            </motion.h2>

            <div className="space-y-4">
              {steps.map((slot, i) => {
                const isPrimary = i === 0;
                const cardBg =
                  slot === "book-first" && i === 0
                    ? "bg-gradient-to-br from-golden/25 via-cream-soft to-cream-soft"
                    : "bg-cream-soft";
                return (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.15, duration: 0.45 }}
                    className={`${cardBg} rounded-3xl border-l-4 ${SLOT_ACCENT[slot]} px-6 py-5 shadow-warm flex items-start gap-5`}
                  >
                    <span className="w-9 h-9 rounded-full bg-brown text-cream font-display text-base flex items-center justify-center flex-shrink-0 mt-0.5 shadow-warm">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-lg text-brown mb-1 leading-snug">
                        {t(`roadmap.steps.${slot}.title`)}
                      </h3>
                      <p className="text-sm text-brown/75 leading-relaxed mb-3">
                        {t(`roadmap.steps.${slot}.body`)}
                      </p>
                      <Link
                        href={SLOT_HREFS[slot]}
                        className={`link-warm inline-flex items-center gap-1 text-sm ${isPrimary ? "text-terra" : "text-brown"}`}
                      >
                        {t(`roadmap.steps.${slot}.cta`)} →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Retake */}
          <section className="pb-16 text-center">
            <p className="text-brown/55 text-sm mb-2">{t("roadmap.retake")}</p>
            <Link
              href="/questionnaire"
              className="link-warm text-sm text-terra"
            >
              {t("roadmap.retakeCta")} →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
