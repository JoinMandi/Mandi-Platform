"use client";

import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

const HISTORICAL = [
  {
    name: "Sarah Baartman",
    years: "c. 1789 – 1815 · Eastern Cape, South Africa",
    body: "A Khoikhoi woman taken from South Africa in 1810 and exhibited across Europe as a public spectacle. She died in Paris in 1815, aged 26. Her body remained on display in France until 1974. Nelson Mandela formally requested her return in 1994. On 9 August 2002 — National Women's Day — she was finally buried near her birthplace. She came home. She belongs to all of us.",
  },
  {
    name: "Anarcha, Betsey, Lucy",
    years: "Montgomery, Alabama · 1840s",
    body: "Three enslaved Black women whose names we know. Between 1845 and 1849 they were subjected to experimental surgery — Anarcha underwent at least 30 operations without anaesthesia — as the foundation of modern gynaecology was built on their suffering. In 2021, a 15-foot monument was erected in their honour. Their names are spoken now.",
  },
];

const LIVING_WALL = [
  {
    name: "Thandi, 52",
    location: "Soweto · isiZulu",
    quote:
      "For three years I thought I was losing my mind. My doctor said I was stressed. Nobody said menopause.",
  },
  {
    name: "Mariette, 49",
    location: "Stellenbosch · Afrikaans",
    quote:
      "Ek het vyf jaar simptome gehad en nie geweet nie. Ek was nie besig om gek te word nie — my hormoon het verander.",
  },
  {
    name: "Nomsa, 55",
    location: "Durban · isiZulu",
    quote:
      "My mother never spoke about this. Her mother never spoke about it. I want my daughter to have a different experience.",
  },
];

export default function HonourTheMothersPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-brown text-cream relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grain" />

        {/* Hero */}
        <section className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
            A Living Tribute
          </p>
          <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
            Honour the Mothers
          </h1>
          <p className="text-cream/80 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            The moral centre of Mandi. A quiet, serious, deeply human acknowledgement that the platform
            women are using today stands on a foundation that has not always honoured women&apos;s bodies,
            voices, or choices.
          </p>
        </section>

        {/* Historical */}
        <section className="relative max-w-3xl mx-auto px-6 pb-20 space-y-16">
          {HISTORICAL.map((s) => (
            <article key={s.name}>
              <h2 className="font-display text-4xl text-golden leading-tight mb-2">
                {s.name}
              </h2>
              <p className="text-cream/60 text-sm mb-5 italic">{s.years}</p>
              <p className="text-cream/85 text-base leading-relaxed">{s.body}</p>
            </article>
          ))}
        </section>

        {/* The women we are still finding */}
        <section className="relative max-w-3xl mx-auto px-6 pb-20">
          <div className="border-l-4 border-golden pl-6 py-2">
            <h3 className="font-display text-2xl text-cream mb-3">
              The women we are still finding.
            </h3>
            <p className="text-cream/80 leading-relaxed">
              African women&apos;s bodies have been sites of medical research, colonial experimentation, and systemic
              neglect across centuries and across the continent. The specific stories are still being uncovered.
              As we find them, we will add them here. If you know a story that belongs on this page, we want to hear it.
            </p>
          </div>
        </section>

        {/* Living wall */}
        <section className="relative bg-brown-deep/60 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-3 text-center">
              The Living Wall
            </p>
            <h3 className="font-display text-3xl text-cream text-center mb-3">
              Have you ever been dismissed? You are not alone.
            </h3>
            <p className="text-cream/70 text-center mb-10 max-w-xl mx-auto">
              Short stories submitted by Mandi users. Three sentences or less. Anonymous if they choose.
              Together they become something powerful.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {LIVING_WALL.map((s) => (
                <blockquote
                  key={s.name}
                  className="bg-brown/60 backdrop-blur-sm border border-cream/10 rounded-3xl px-6 py-5"
                >
                  <p className="text-cream/90 text-sm leading-relaxed italic mb-4">&ldquo;{s.quote}&rdquo;</p>
                  <p className="text-golden font-semibold text-sm">{s.name}</p>
                  <p className="text-cream/50 text-xs">{s.location}</p>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="font-display text-2xl sm:text-3xl text-golden leading-tight mb-5">
            Sarah Baartman. Anarcha. Betsey. Lucy.<br />
            And every woman whose name was never written down.
          </p>
          <p className="text-cream/75 italic leading-relaxed mb-10">
            Their bodies carried the burden of a science that did not yet know how to treat them as human.
            Mandi is built in their honour. This page will keep growing — because there are more names to find,
            and more women to hear.
          </p>
          <Link
            href="mailto:hermi@mrsking.co.za?subject=A story for Honour the Mothers"
            className="inline-block bg-cream text-brown font-semibold rounded-full px-8 py-4 hover:bg-golden transition-colors shadow-warm-lg"
          >
            Share a story with Mandi →
          </Link>
        </section>

        {/* Hermi quote */}
        <section className="relative border-t border-cream/10 py-16">
          <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row gap-10 items-center">
            <div className="relative h-56 w-56 flex-shrink-0 rounded-3xl overflow-hidden shadow-warm-xl">
              <Image src="/images/woman-icecream.jpg" alt="Hermi" fill className="object-cover" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-cream/85 text-base leading-relaxed italic mb-4">
                &ldquo;This platform was born from my own story — years of symptoms that nobody connected to my
                hormones. Once you know better, you can do better. And you can help others do the same.&rdquo;
              </p>
              <p className="text-golden text-sm font-semibold">Hermi King</p>
              <p className="text-cream/50 text-xs">Founder · MrsKing Productions</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
