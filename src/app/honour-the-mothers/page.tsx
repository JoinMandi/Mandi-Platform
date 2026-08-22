"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Footer, { CONTACT_EMAIL } from "@/components/Footer";
import Reveal from "@/components/ui/Reveal";
import StitchDivider from "@/components/ui/StitchDivider";

const HISTORICAL = [
  { id: "baartman", name: "Sarah Baartman" },
  { id: "anarcha", name: "Anarcha, Betsey, Lucy" },
];

const LIVING_WALL = [
  { id: "thandi", name: "Thandi, 52", location: "Soweto · isiZulu" },
  { id: "mariette", name: "Mariette, 49", location: "Stellenbosch · Afrikaans" },
  { id: "nomsa", name: "Nomsa, 55", location: "Durban · isiZulu" },
];

export default function HonourTheMothersPage() {
  const { t } = useTranslation("common");

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-brown text-cream relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grain" />

        {/* Hero */}
        <section className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <Reveal variant="fade">
            <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              {t("mothers.eyebrow")}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
              {t("mothers.title")}
            </h1>
            <p className="text-cream/80 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              {t("mothers.subhead")}
            </p>
          </Reveal>
        </section>

        {/* Historical */}
        <section className="relative max-w-3xl mx-auto px-6 pb-20 space-y-16">
          {HISTORICAL.map((s) => (
            <Reveal as="article" key={s.id} variant="fade">
              <h2 className="font-display text-4xl text-golden leading-tight mb-2">
                {s.name}
              </h2>
              <p className="text-cream/60 text-sm mb-5 italic">
                {t(`mothers.historical.${s.id}.years`)}
              </p>
              <p className="text-cream/85 text-base leading-relaxed">
                {t(`mothers.historical.${s.id}.body`)}
              </p>
            </Reveal>
          ))}
        </section>

        {/* The women we are still finding */}
        <section className="relative max-w-3xl mx-auto px-6 pb-20">
          <Reveal variant="fade">
            <div className="border-l-4 border-golden pl-6 py-2">
              <h3 className="font-display text-2xl text-cream mb-3">
                {t("mothers.finding.heading")}
              </h3>
              <p className="text-cream/80 leading-relaxed">{t("mothers.finding.body")}</p>
            </div>
          </Reveal>
        </section>

        {/* Living wall */}
        <section className="relative bg-brown-deep/60 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal variant="fade">
              <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-3 text-center">
                {t("mothers.wall.eyebrow")}
              </p>
              <h3 className="font-display text-3xl text-cream text-center mb-3">
                {t("mothers.wall.heading")}
              </h3>
              <p className="text-cream/70 text-center mb-10 max-w-xl mx-auto">
                {t("mothers.wall.intro")}
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {LIVING_WALL.map((s, i) => (
                <Reveal
                  as="blockquote"
                  key={s.id}
                  variant="fade"
                  delay={i * 80}
                  className="bg-brown/60 backdrop-blur-sm border border-cream/10 rounded-3xl px-6 py-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="text-cream/90 text-sm leading-relaxed italic mb-4">
                    &ldquo;{t(`mothers.wall.${s.id}`)}&rdquo;
                  </p>
                  <p className="text-golden font-semibold text-sm">{s.name}</p>
                  <p className="text-cream/50 text-xs">{s.location}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <Reveal variant="fade">
            <p className="font-display text-2xl sm:text-3xl text-golden leading-tight mb-5">
              {t("mothers.closing.names")}
            </p>
            <p className="text-cream/75 italic leading-relaxed mb-10">
              {t("mothers.closing.body")}
            </p>
            <Link
              href={`mailto:${CONTACT_EMAIL}?subject=A story for Honour the Mothers`}
              className="inline-block bg-cream text-brown font-semibold rounded-full px-8 py-4 hover:bg-golden transition-colors shadow-warm-lg"
            >
              {t("mothers.closing.cta")} →
            </Link>
            {/* Visible address: mailto: is inert on kiosks and mail-less browsers. */}
            <p className="mt-4 text-cream/70 text-sm">{CONTACT_EMAIL}</p>
          </Reveal>
        </section>

        <div className="relative max-w-3xl mx-auto px-6">
          <StitchDivider tone="gold" />
        </div>

        {/* Hermi quote */}
        <section className="relative py-16">
          <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row gap-10 items-center">
            <Reveal variant="fade" className="flex-shrink-0">
              <div className="relative h-56 w-56 rounded-3xl overflow-hidden shadow-warm-xl">
                <Image src="/images/woman-icecream.jpg" alt="Hermi" fill className="object-cover" />
              </div>
            </Reveal>
            <Reveal variant="fade" delay={120} className="flex-1">
              <div className="text-left">
                <p className="text-cream/85 text-base leading-relaxed italic mb-4">
                  &ldquo;{t("mothers.founder.quote")}&rdquo;
                </p>
                <p className="text-golden text-sm font-semibold">Hermi King</p>
                <p className="text-cream/50 text-xs">{t("mothers.founder.role")}</p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
