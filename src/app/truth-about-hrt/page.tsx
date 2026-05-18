"use client";

import Link from "next/link";
import NavBar from "@/components/NavBar";

const TIMELINE: Array<{ year: string; headline: string; body: string; tone: "neutral" | "warning" | "turning" | "today" }> = [
  { year: "1992", tone: "neutral",  headline: "Premarin peaks.",
    body: "Premarin — made from the urine of pregnant mares — becomes the most prescribed drug in the US. The WHI study begins, testing Premarin plus Provera on 160,000 women." },
  { year: "2002", tone: "warning",  headline: "The study that changed everything — for the wrong reasons.",
    body: "The WHI trial is stopped early. Global headlines declare HRT causes breast cancer. Use collapses by 80%. The absolute risk — 4 cases per 1,000 women over 5 years — is rarely mentioned. Results are applied to all HRT, including body-identical hormones that were never studied." },
  { year: "2003", tone: "warning",  headline: "Black-box warnings applied.",
    body: "The FDA applies class-wide black-box warnings to all HRT products — including body-identical hormones that carry no such evidence of harm. A generation of women is denied treatment based on findings that do not apply to them." },
  { year: "2008", tone: "turning",  headline: "The pivotal French finding.",
    body: "The E3N cohort study finds that body-identical progesterone does not increase breast cancer risk — unlike the synthetic progestin used in WHI. The problem in 2002 was never oestrogen — it was the specific synthetic used." },
  { year: "2013", tone: "turning",  headline: "Oestrogen alone reduces breast cancer risk.",
    body: "A decade of WHI follow-up confirms estrogen-only HRT significantly reduces breast cancer incidence and mortality. This directly contradicts the 2002 message — but it takes ten years to reach the public." },
  { year: "2015", tone: "turning",  headline: "UK NICE recommends body-identical HRT.",
    body: "Body-identical HRT — estradiol patches or gel with micronised progesterone — becomes the recommended approach. HRT prescriptions in England begin rising from this point." },
  { year: "Nov 2025", tone: "today", headline: "FDA removes the warnings.",
    body: "The US HHS and FDA announce the removal of broad black-box warnings. The FDA states: women who start HRT within 10 years of menopause may reduce cardiovascular risk by up to 50%, Alzheimer's risk by 35%, and fracture risk by 50–60%." },
  { year: "Aug 2026", tone: "today", headline: "Meer as Warm Gloede airs. JoinMandi.com launches.",
    body: "Every South African woman deserves this history — in her language." },
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
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk">
          <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center">
            <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-4">
              Education
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
              The Truth About HRT
            </h1>
            <p className="text-cream/90 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
              Fear travelled the world in 24 hours in 2002. The correction has taken 23 years.
              Here is what every woman deserves to know — in plain English.
            </p>
          </div>
        </section>

        {/* Synthetic vs Body-identical */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl text-brown text-center mb-4">
            Synthetic vs Body-identical
          </h2>
          <p className="text-brown/70 text-center max-w-xl mx-auto mb-10 leading-relaxed">
            The most important thing women do not know is that not all HRT is the same. This distinction is
            the key to everything that follows.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-brown text-cream rounded-3xl p-7 shadow-warm-lg">
              <p className="text-golden text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                Synthetic / non-human HRT
              </p>
              <h3 className="font-display text-2xl mb-4">Premarin · Provera</h3>
              <p className="text-cream/85 text-sm leading-relaxed mb-3">
                Premarin — made from horse urine — contains estrogens the human body does not naturally produce.
                Provera (MPA) — a synthetic progestin. Not the same molecule as human progesterone.
              </p>
              <p className="text-golden text-sm font-semibold">
                This is what the 2002 WHI study tested.
              </p>
            </div>
            <div className="bg-golden text-brown rounded-3xl p-7 shadow-warm-lg">
              <p className="text-terra text-[11px] uppercase tracking-[0.2em] font-semibold mb-3">
                Body-identical HRT
              </p>
              <h3 className="font-display text-2xl mb-4">Estradiol · Micronised Progesterone</h3>
              <p className="text-brown/85 text-sm leading-relaxed mb-3">
                Estradiol (17β-estradiol) — derived from plants. Chemically identical to human oestrogen.
                Micronised progesterone (Prometrium / Utrogestan) — identical to human progesterone.
              </p>
              <p className="text-terra text-sm font-semibold">
                This is the recommended approach today.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-cream-deep/40 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-display text-3xl text-brown text-center mb-3">
              1992 — Today
            </h2>
            <p className="text-brown/70 text-center mb-12 max-w-xl mx-auto">
              A timeline of what actually happened — and what is changing now.
            </p>
            <div className="space-y-4">
              {TIMELINE.map((e, i) => (
                <article
                  key={e.year + i}
                  className={`rounded-3xl border-l-4 border-coral px-7 py-6 shadow-warm ${toneStyles[e.tone]}`}
                >
                  <div className="flex items-baseline gap-5 mb-2 flex-wrap">
                    <span className="font-display text-3xl text-terra">{e.year}</span>
                    <h3 className="font-semibold text-brown text-base leading-snug">{e.headline}</h3>
                  </div>
                  <p className="text-brown/80 text-sm leading-relaxed">{e.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Sources */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl text-brown mb-4">Sources</h2>
          <ul className="space-y-2 text-sm text-brown/70 list-none border-l-2 border-coral/40 pl-5">
            {SOURCES.map((s, i) => (
              <li key={i}>
                <span className="text-terra font-semibold mr-2">[{i + 1}]</span>
                {s}
              </li>
            ))}
          </ul>
          <p className="text-xs text-brown/50 italic mt-6 leading-relaxed">
            Educational information only — not medical advice. Discuss your individual circumstances with a qualified
            healthcare provider.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-mandi-gradient py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl text-cream mb-4">Where does this leave you?</h2>
            <p className="text-cream/90 mb-8 max-w-xl mx-auto">
              You deserve honest answers in your own language from practitioners who understand hormonal health.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/questionnaire"
                className="bg-cream text-terra font-semibold rounded-full px-7 py-4 hover:bg-golden transition-colors shadow-warm-lg"
              >
                Take the questionnaire →
              </Link>
              <Link
                href="/find-a-doctor"
                className="bg-transparent border-2 border-cream text-cream font-semibold rounded-full px-7 py-4 hover:bg-cream hover:text-terra transition-colors"
              >
                Find a doctor
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
