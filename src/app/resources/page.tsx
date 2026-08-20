"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import Reveal from "@/components/ui/Reveal";
import StitchDivider from "@/components/ui/StitchDivider";
import { logEngagement } from "@/server/actions/engagement";

const CATEGORIES = [
  { key: "understanding", color: "bg-golden/20 text-brown border-golden/40" },
  { key: "hrt", color: "bg-terra/10 text-terra border-terra/30" },
  { key: "mental", color: "bg-pink-mandi/10 text-pink-mandi border-pink-mandi/30" },
  { key: "nutrition", color: "bg-coral/10 text-terra border-coral/30" },
  { key: "research", color: "bg-brown/10 text-brown border-brown/20" },
];

const RESOURCES = [
  { id: "perimenopause", categoryKey: "understanding", typeKey: "article",  sourceKey: "editorial", lang: ["en", "af"] },
  { id: "symptoms",      categoryKey: "understanding", typeKey: "guide",    sourceKey: "editorial", lang: ["en"] },
  { id: "bodyIdentical", categoryKey: "hrt",           typeKey: "article",  sourceKey: "editorial", lang: ["en", "af"] },
  { id: "routes",        categoryKey: "hrt",           typeKey: "guide",    sourceKey: "editorial", lang: ["en"] },
  { id: "mood",          categoryKey: "mental",        typeKey: "article",  sourceKey: "editorial", lang: ["en", "zu", "xh"] },
  { id: "nutrition",     categoryKey: "nutrition",     typeKey: "guide",    sourceKey: "editorial", lang: ["en", "af"] },
  { id: "whi",           categoryKey: "research",      typeKey: "research", sourceKey: "editorial", lang: ["en"] },
  { id: "brain",         categoryKey: "research",      typeKey: "research", sourceKey: "mosconi",   lang: ["en"] },
];

const LANG_LABELS: Record<string, string> = { en: "EN", af: "AF", zu: "ZU", xh: "XH" };

export default function ResourcesPage() {
  const { t } = useTranslation("common");

  // Log one content_view per visible resource per mount.
  useEffect(() => {
    for (const r of RESOURCES) {
      void logEngagement({ eventType: "content_view", targetId: r.id });
    }
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">

        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <AmbientBlobs intensity="soft" />
          <div className="absolute inset-0 bg-brown/15" />
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20">
            <Reveal>
              <p className="text-cream/85 text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("resources.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05] max-w-2xl">
                {t("resources.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-cream/85 text-lg mt-5 max-w-xl leading-relaxed">
                {t("resources.subhead")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <p className="text-brown/80 text-base leading-relaxed max-w-2xl">
              {t("resources.intro")}
            </p>
          </Reveal>
        </section>

        {/* Category filters */}
        <section className="max-w-4xl mx-auto px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {/* Category labels are informational until filtering ships — render
                as plain text, never as fake-interactive controls. */}
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.key} variant="fade" delay={i * 60}>
                <span
                  aria-hidden
                  className={`inline-block text-xs font-semibold border rounded-full px-4 py-1.5 ${c.color}`}
                >
                  {t(`resources.category.${c.key}`)}
                </span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Resources grid */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            {RESOURCES.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i, 6) * 60}>
                {/* Article pages don't exist yet — no cursor/click pretence
                    until they do; content_view is logged on mount above. */}
                <article className="h-full bg-cream-soft rounded-3xl shadow-warm p-7 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terra">
                      {t(`resources.category.${r.categoryKey}`)}
                    </span>
                    <span className="text-[10px] text-brown/40 bg-brown/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {t(`resources.type.${r.typeKey}`)}
                    </span>
                  </div>
                  <h3 className="font-display text-lg text-brown leading-snug">
                    {t(`resources.items.${r.id}.title`)}
                  </h3>
                  <p className="text-sm text-brown/70 leading-relaxed flex-1">
                    {t(`resources.items.${r.id}.description`)}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-golden/20">
                    <span className="text-xs text-brown/40">{t(`resources.source.${r.sourceKey}`)}</span>
                    <div className="flex gap-1">
                      {r.lang.map((l) => (
                        <span key={l} className="text-xs bg-golden/20 text-brown px-2 py-0.5 rounded-full font-medium">
                          {LANG_LABELS[l]}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <StitchDivider tone="gold" />
          </div>
          <Reveal variant="fade">
            <p className="mt-6 text-center text-brown/60 text-sm">{t("resources.notice1")}</p>
            <p className="mt-2 text-center text-brown/40 text-xs">{t("resources.notice2")}</p>
          </Reveal>
        </section>

        {/* Closer — into the journey */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk py-16">
          <AmbientBlobs intensity="soft" />
          <div className="absolute inset-0 bg-brown/25" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-6">
                {t("hrt.cta.heading")}
              </h2>
              <Link
                href="/consent"
                className="inline-block bg-cream text-terra font-semibold rounded-full px-9 py-4 text-base shadow-warm-xl hover:bg-golden transition-colors"
              >
                {t("hrt.cta.questionnaire")} →
              </Link>
            </Reveal>
          </div>
        </section>

      </main>
    </>
  );
}
