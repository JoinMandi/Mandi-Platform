"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import StitchDivider from "@/components/ui/StitchDivider";

const LANGUAGE_CARDS = [
  { code: "english", rot: "-rotate-2" },
  { code: "zulu", rot: "rotate-1" },
  { code: "xhosa", rot: "-rotate-1" },
  { code: "afrikaans", rot: "rotate-2" },
];

export default function AboutPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <NavBar />
      <main className="relative min-h-screen overflow-hidden bg-cream">
        <AmbientBlobs intensity="soft" />

        <div className="relative">
          {/* Hero */}
          <section className="relative overflow-hidden bg-mandi-gradient">
            <AmbientBlobs intensity="full" />
            <div className="absolute inset-0 bg-brown/15" />
            <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-center">
              <Reveal>
                <p className="text-cream/85 text-[11px] font-semibold uppercase tracking-[0.25em] mb-4">
                  {t("about.eyebrow")}
                </p>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
                  {t("about.title")}
                </h1>
              </Reveal>
            </div>
          </section>

          {/* The name */}
          <section className="max-w-3xl mx-auto px-6 py-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">
                {t("about.name.eyebrow")}
              </p>
              <p className="font-display text-3xl text-brown leading-snug mb-6">
                {t("about.name.heading")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <p className="text-brown/80 text-base leading-relaxed mb-4">{t("about.name.p1")}</p>
              <p className="text-brown/80 text-base leading-relaxed mb-4">{t("about.name.p2")}</p>
              <p className="text-brown font-semibold text-base">{t("about.name.p3")}</p>
            </Reveal>
          </section>

          {/* Divider */}
          <div className="max-w-3xl mx-auto px-6">
            <StitchDivider tone="gold" />
          </div>

          {/* Hermi's story */}
          <section className="max-w-3xl mx-auto px-6 py-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">
                {t("about.story.eyebrow")}
              </p>
              <p className="font-display text-3xl text-brown leading-snug mb-8">
                {t("about.story.heading")}
              </p>
            </Reveal>

            <div className="flex flex-col sm:flex-row gap-10 items-start mb-10">
              <Reveal className="flex-1">
                <div className="space-y-5 text-brown/80 text-base leading-relaxed">
                  <p>{t("about.story.p1")}</p>
                  <p>{t("about.story.p2")}</p>
                  <p>{t("about.story.p3")}</p>
                  <p>{t("about.story.p4")}</p>
                </div>
              </Reveal>
              <Reveal variant="stitch" delay={120} className="sm:w-52 flex-shrink-0">
                <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-lg">
                  <Image src="/images/woman-cycling.jpg" alt="A woman living fully" fill className="object-cover" />
                </div>
              </Reveal>
            </div>

            <Reveal>
              <div className="bg-golden/20 rounded-2xl px-8 py-6 border-l-4 border-golden mb-10 transition-shadow hover:shadow-warm-lg">
                <p className="text-brown/80 text-base leading-relaxed italic">
                  &ldquo;{t("about.story.quote")}&rdquo;
                </p>
                <p className="text-brown/60 text-sm mt-2">— {t("about.story.quoteAuthor")}</p>
              </div>
            </Reveal>

            <Reveal>
              <div className="space-y-5 text-brown/80 text-base leading-relaxed">
                <p>{t("about.story.p5")}</p>
                <p>{t("about.story.p6")}</p>
                <p>{t("about.story.p7")}</p>
              </div>
            </Reveal>
          </section>

          {/* Divider */}
          <div className="max-w-3xl mx-auto px-6">
            <StitchDivider tone="gold" />
          </div>

          {/* Vision */}
          <section className="max-w-3xl mx-auto px-6 py-16">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">
                {t("about.vision.eyebrow")}
              </p>
              <p className="font-display text-3xl text-brown leading-snug mb-6">
                {t("about.vision.heading")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <p className="text-brown/80 text-base leading-relaxed mb-4">{t("about.vision.p1")}</p>
              <p className="text-brown/80 text-base leading-relaxed mb-10">{t("about.vision.p2")}</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LANGUAGE_CARDS.map((l, i) => (
                <Reveal key={l.code} variant="stitch" delay={i * 80}>
                  <div
                    className={`${l.rot} hover:rotate-0 hover:-translate-y-1 transition-transform duration-300
                      bg-cream-soft border-2 border-dashed border-coral/35 rounded-2xl px-6 py-4
                      flex items-center justify-between shadow-warm`}
                  >
                    <span className="font-semibold text-brown">{t(`language.${l.code}`)}</span>
                    <span className="text-xs text-brown/55 bg-golden/25 px-2.5 py-0.5 rounded-full">
                      {t(`language.${l.code}Sub`)}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="max-w-3xl mx-auto px-6">
            <StitchDivider tone="gold" />
          </div>

          {/* No woman alone */}
          <section className="relative overflow-hidden bg-mandi-gradient-dusk">
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
              <Reveal variant="fade">
                <p className="font-display text-3xl sm:text-4xl text-cream leading-tight">
                  {t("about.alone.headline")}
                </p>
                <p className="text-golden mt-6 text-sm font-semibold uppercase tracking-[0.2em]">
                  {t("about.alone.credit")}
                </p>
              </Reveal>
            </div>
          </section>

          {/* Mandi blanket image */}
          <section className="max-w-3xl mx-auto px-6 py-16 flex flex-col sm:flex-row gap-10 items-center">
            <Reveal variant="stitch" className="w-full sm:w-72 flex-shrink-0">
              <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/mandi-blanket.jpg"
                  alt="The Mandi Blanket — different fabrics, one community"
                  fill
                  className="object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120} className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-4">
                {t("about.blanket.eyebrow")}
              </p>
              <p className="text-brown/80 text-base leading-relaxed">{t("about.blanket.body")}</p>
            </Reveal>
          </section>

          {/* Footer CTA — mission closer */}
          <section className="relative overflow-hidden bg-mandi-gradient-dusk py-20">
            <AmbientBlobs intensity="soft" />
            <div className="absolute inset-0 bg-brown/25" />
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              <Reveal>
                <p className="font-display text-cream text-3xl sm:text-4xl mb-4">{t("about.cta.heading")}</p>
                <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-cream/85">
                  {t("landing.mission")}
                </p>
                <a
                  href="/consent"
                  className="inline-block bg-cream text-terra font-semibold rounded-full px-10 py-4 text-base hover:bg-golden transition-colors shadow-warm-xl"
                >
                  {t("about.cta.button")} →
                </a>
              </Reveal>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
