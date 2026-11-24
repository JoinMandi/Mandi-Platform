"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import CountUp from "@/components/ui/CountUp";
import Quilt from "@/components/ui/Quilt";
import Reveal from "@/components/ui/Reveal";
import StitchDivider from "@/components/ui/StitchDivider";
import KeepBlanketCard from "@/components/ui/KeepBlanketCard";
import Footer from "@/components/Footer";
import { questions } from "@/lib/domain/questions";
import { buildQuilt } from "@/lib/domain/quilt";
import { domainScores } from "@/lib/domain/scoring";
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
  const [pdfLang, setPdfLang] = useState("en");

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

  const domains = useMemo(
    () =>
      answers
        ? domainScores(answers)
            .filter((d) => d.total > 0)
            .slice(0, 3)
        : [],
    [answers],
  );

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

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero — the emotional peak of the funnel */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <AmbientBlobs intensity="full" />
          <div className="pointer-events-none absolute inset-0 bg-brown/20" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
            <Reveal variant="fade">
              <p className="text-cream/80 text-xs uppercase tracking-[0.25em] font-semibold mb-4">
                {t("roadmap.title")}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
                {t(`roadmap.persona.${data.persona}.headline`)}
              </h1>
            </Reveal>
            <Reveal delay={250} variant="fade">
              <p className="mt-5 text-cream/90 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                {t(`roadmap.persona.${data.persona}.body`)}
              </p>
            </Reveal>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
          {/* MenoScore card */}
          <Reveal delay={200}>
            <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10">
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
              <p className="mt-6 text-center text-xs font-medium text-brown/50">
                {t("roadmap.disclaimer")}
              </p>
            </div>
          </Reveal>

          {/* Where it presses hardest, and the two things to take to a doctor */}
          <Reveal delay={100}>
            <div className="mt-6 bg-cream-soft rounded-4xl shadow-warm p-7 sm:p-9">
              <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold">
                {t("roadmap.topEyebrow")}
              </p>
              <h2 className="mt-1 font-display text-2xl text-brown">
                {t("roadmap.topTitle")}
              </h2>
              <div className="mt-5 space-y-4">
                {domains.map((d) => (
                  <div key={d.domain}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-brown">
                        {t(`questionnaire.domain.${d.domain}.title`)}
                      </span>
                      <span className="font-display text-lg text-terra">
                        {d.percent}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-deep/50">
                      <div
                        className="h-full rounded-full bg-terra"
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/summary"
                  className="rounded-2xl border border-cream-deep/60 bg-white/70 p-4 transition-colors hover:border-terra"
                >
                  <p className="text-sm font-semibold text-brown">
                    {t("roadmap.doctorSummaryTitle")}
                  </p>
                  <p className="mt-1 text-xs text-brown/60">
                    {t("roadmap.doctorSummaryBody")}
                  </p>
                  <span className="mt-2 inline-block text-xs font-semibold text-terra">
                    {t("roadmap.view")} →
                  </span>
                </Link>
                <Link
                  href="/summary#guidance"
                  className="rounded-2xl border border-cream-deep/60 bg-white/70 p-4 transition-colors hover:border-terra"
                >
                  <p className="text-sm font-semibold text-brown">
                    {t("roadmap.guidanceTitle")}
                  </p>
                  <p className="mt-1 text-xs text-brown/60">
                    {t("roadmap.guidanceBody")}
                  </p>
                  <span className="mt-2 inline-block text-xs font-semibold text-terra">
                    {t("roadmap.view")} →
                  </span>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* The blanket she stitched */}
          {patches.length > 0 && (
            <Reveal delay={120}>
              <div className="mt-6 bg-cream-soft rounded-4xl shadow-warm p-7 sm:p-9 text-center">
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
              </div>
            </Reveal>
          )}

          {/* Safety flags — copy is clinically frozen; wrappers only */}
          {data.selfHarmFlag && (
            <Reveal delay={100}>
              <div className="mt-6 bg-brown text-cream rounded-3xl px-7 py-6 shadow-warm-lg">
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
              </div>
            </Reveal>
          )}

          {data.colleenFlag && (
            <Reveal delay={100}>
              <div className="mt-6 bg-golden/20 border border-golden/40 rounded-3xl px-7 py-5 shadow-warm">
                <p className="font-semibold text-brown mb-1">{t("roadmap.safety.colleen.title")}</p>
                <p className="text-brown/80 text-sm leading-relaxed">
                  {t("roadmap.safety.colleen.body")}
                </p>
              </div>
            </Reveal>
          )}

          {/* Two ways forward, instead of the old six-step roadmap */}
          <section className="mt-8">
            <h2 className="mb-4 font-display text-2xl text-brown">
              {t("roadmap.nextTitle")}
            </h2>
            <div className="grid gap-4">
              <div className="rounded-4xl border-l-4 border-golden bg-gradient-to-br from-golden/25 via-cream-soft to-cream-soft p-7 shadow-warm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-terra">
                  {t("roadmap.joinEyebrow")}
                </p>
                <h3 className="mt-1 font-display text-xl text-brown">
                  {t("roadmap.joinTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brown/70">
                  {t("roadmap.joinBody")}
                </p>
                <Link
                  href="/find-a-doctor"
                  className="mt-4 inline-block rounded-full bg-terra px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terra-dark"
                >
                  {t("roadmap.joinCta")} →
                </Link>
              </div>

              <div className="rounded-4xl border-l-4 border-brown bg-cream-soft p-7 shadow-warm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brown/60">
                  {t("roadmap.or")}
                </p>
                <h3 className="mt-1 font-display text-xl text-brown">
                  {t("roadmap.emailTitle")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brown/70">
                  {t("roadmap.emailBody")}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-brown/60">
                    {t("roadmap.pdfLanguage")}
                  </span>
                  {[
                    { code: "en", label: t("language.english") },
                    { code: "zu", label: t("language.zulu") },
                    { code: "xh", label: t("language.xhosa") },
                    { code: "af", label: t("language.afrikaans") },
                  ].map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setPdfLang(l.code)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        pdfLang === l.code
                          ? "bg-terra text-cream"
                          : "border border-cream-deep bg-white text-brown"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <a
                    href="#keep"
                    className="inline-block rounded-full border-2 border-brown px-6 py-3 text-sm font-semibold text-brown"
                  >
                    {t("roadmap.emailCta")} →
                  </a>
                  <Link
                    href={`/summary?lang=${pdfLang}`}
                    className="text-sm font-semibold text-terra underline"
                  >
                    {t("roadmap.download")}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Keep the score, keep the woman — an invitation, below the safety flags */}
          <div id="keep">
            <Reveal delay={140}>
              <KeepBlanketCard
                menoScore={data.menoScore}
                scoreBand={data.scoreBand}
                answers={answers}
              />
            </Reveal>
          </div>

          <div className="mt-10">
            <StitchDivider tone="gold" />
          </div>

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

        {/* Mission closer */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk py-16">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/25" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <Reveal>
              <p className="mx-auto max-w-lg font-display text-2xl sm:text-3xl leading-snug text-cream">
                {t("landing.mission")}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
