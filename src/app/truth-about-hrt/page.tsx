"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import Reveal from "@/components/ui/Reveal";
import StitchDivider from "@/components/ui/StitchDivider";

const TIMELINE: Array<{ id: string; year: string; tone: "neutral" | "warning" | "turning" | "today" }> = [
  { id: "t1992", year: "1992",     tone: "neutral" },
  { id: "t2002", year: "2002",     tone: "warning" },
  { id: "t2003", year: "2003",     tone: "warning" },
  { id: "t2008", year: "2008",     tone: "turning" },
  { id: "t2013", year: "2013",     tone: "turning" },
  { id: "t2015", year: "2015",     tone: "turning" },
  { id: "t2025", year: "Nov 2025", tone: "today" },
  { id: "t2026", year: "Aug 2026", tone: "today" },
];

const SOURCES = [
  "Rossouw JE et al. JAMA 2002;288(3):321–333.",
  "Langer RD. Climacteric 2017;20(2):91–96.",
  "Fournier A et al. Breast Cancer Res Treat 2008;107(1):103–111.",
  "Manson JE et al. JAMA 2013;310(13):1353–1368.",
  "NICE Guideline NG23, 2015 (updated 2019).",
  "HHS press release, 10 November 2025.",
  "Makary MA et al. JAMA 2026;335(2):117–118.",
];

const toneStyles: Record<typeof TIMELINE[number]["tone"], string> = {
  neutral: "bg-cream-soft",
  warning: "bg-[#F3E0D8]",
  turning: "bg-[#EDE4D0]",
  today:   "bg-golden/25",
};

export default function TruthAboutHRTPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/20" />
          <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center">
            <Reveal>
              <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
                {t("hrt.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
                {t("hrt.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-cream/90 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
                {t("hrt.subhead")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Synthetic vs Body-identical */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <Reveal>
            <h2 className="font-display text-3xl text-brown text-center mb-4">
              {t("hrt.compare.heading")}
            </h2>
            <p className="text-brown/70 text-center max-w-xl mx-auto mb-10 leading-relaxed">
              {t("hrt.compare.intro")}
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            <Reveal>
              <div className="h-full bg-brown text-cream rounded-3xl p-7 shadow-warm-lg transition-transform duration-300 hover:-translate-y-1">
                <p className="text-golden text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                  {t("hrt.compare.synthetic.label")}
                </p>
                <h3 className="font-display text-2xl mb-4">{t("hrt.compare.synthetic.name")}</h3>
                <p className="text-cream/85 text-sm leading-relaxed mb-3">
                  {t("hrt.compare.synthetic.body")}
                </p>
                <p className="text-golden text-sm font-semibold">
                  {t("hrt.compare.synthetic.note")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={130}>
              <div className="h-full bg-golden text-brown rounded-3xl p-7 shadow-warm-lg transition-transform duration-300 hover:-translate-y-1">
                <p className="text-terra text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                  {t("hrt.compare.bodyIdentical.label")}
                </p>
                <h3 className="font-display text-2xl mb-4">{t("hrt.compare.bodyIdentical.name")}</h3>
                <p className="text-brown/85 text-sm leading-relaxed mb-3">
                  {t("hrt.compare.bodyIdentical.body")}
                </p>
                <p className="text-terra text-sm font-semibold">
                  {t("hrt.compare.bodyIdentical.note")}
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-cream-deep/40 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <Reveal>
              <h2 className="font-display text-3xl text-brown text-center mb-3">
                {t("hrt.timeline.heading")}
              </h2>
              <p className="text-brown/70 text-center mb-12 max-w-xl mx-auto">
                {t("hrt.timeline.intro")}
              </p>
            </Reveal>
            <div className="space-y-4">
              {TIMELINE.map((e, i) => (
                <Reveal
                  as="article"
                  key={e.id}
                  variant="stitch"
                  delay={Math.min(i, 6) * 70}
                  className={`rounded-3xl border-l-4 border-dashed border-coral px-7 py-6 shadow-warm ${toneStyles[e.tone]}`}
                >
                  <div className="flex items-baseline gap-5 mb-2 flex-wrap">
                    <span className="font-display text-3xl text-terra">{e.year}</span>
                    <h3 className="font-semibold text-brown text-base leading-snug">
                      {t(`hrt.timeline.${e.id}.headline`)}
                    </h3>
                  </div>
                  <p className="text-brown/80 text-sm leading-relaxed">
                    {t(`hrt.timeline.${e.id}.body`)}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <Reveal>
            <h2 className="font-display text-2xl text-brown mb-4">{t("hrt.sources.heading")}</h2>
            <ul className="space-y-2 text-sm text-brown/70 list-none border-l-2 border-dashed border-coral/40 pl-5">
              {SOURCES.map((s, i) => (
                <li key={i}>
                  <span className="text-terra font-semibold mr-2">[{i + 1}]</span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-xs text-brown/50 italic mt-6 leading-relaxed">
              {t("hrt.sources.disclaimer")}
            </p>
          </Reveal>
        </section>

        <div className="max-w-3xl mx-auto px-6">
          <StitchDivider tone="gold" />
        </div>

        {/* CTA */}
        <section className="relative overflow-hidden bg-mandi-gradient py-16">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/15" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl text-cream mb-4">{t("hrt.cta.heading")}</h2>
              <p className="text-cream/90 mb-8 max-w-xl mx-auto">{t("hrt.cta.body")}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/consent"
                  className="bg-cream text-terra font-semibold rounded-full px-7 py-4 hover:bg-golden transition-colors shadow-warm-lg"
                >
                  {t("hrt.cta.questionnaire")} →
                </Link>
                <Link
                  href="/find-a-doctor"
                  className="bg-transparent border-2 border-cream text-cream font-semibold rounded-full px-7 py-4 hover:bg-cream hover:text-terra transition-colors"
                >
                  {t("hrt.cta.doctor")}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
