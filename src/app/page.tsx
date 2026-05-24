"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/ui/Reveal";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import StitchDivider from "@/components/ui/StitchDivider";
import Quilt from "@/components/ui/Quilt";
import { buildQuilt } from "@/lib/domain/quilt";
import { questions } from "@/lib/domain/questions";

// Each tile's label stays in its own language — that is the point. A visitor
// sees all four welcomes simultaneously, taps one, and the rest of the UI
// switches instantly.
const LANGUAGES = [
  { code: "en", label: "Talk to Mandi",   sub: "English"   },
  { code: "zu", label: "Khuluma noMandi", sub: "isiZulu"   },
  { code: "xh", label: "Thetha noMandi",  sub: "isiXhosa"  },
  { code: "af", label: "Praat met Mandi", sub: "Afrikaans" },
];

const HOW_STEPS = ["step1", "step2", "step3"] as const;

const DESTINATIONS = [
  { id: "read",   href: "/truth-about-hrt",    accent: "border-t-terra"  },
  { id: "find",   href: "/find-a-doctor",      accent: "border-t-coral"  },
  { id: "gather", href: "/events",             accent: "border-t-golden" },
  { id: "honour", href: "/honour-the-mothers", accent: "border-t-brown"  },
] as const;

const VOICES = [
  { quoteKey: "mothers.wall.thandi",   name: "Thandi, 52",   location: "Soweto · isiZulu" },
  { quoteKey: "mothers.wall.mariette", name: "Mariette, 49", location: "Stellenbosch · Afrikaans" },
] as const;

// The peek section shows a fully-stitched blanket using the real layout — exactly
// what the visitor would end up with after the questionnaire.
const PEEK_PATCHES = buildQuilt(questions);

export default function LandingPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const activeLang = i18n.language?.slice(0, 2) ?? "en";

  const selectLanguage = (code: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-lang", code);
    }
    void i18n.changeLanguage(code);
  };

  return (
    <>
      <NavBar />
      <main className="bg-cream">

        {/* ─── HERO — open layout, content directly on the gradient ─ */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <AmbientBlobs />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-brown/10" />

          <div className="relative z-10 max-w-3xl mx-auto px-6 pt-16 pb-12 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center">
            <Reveal>
              <p className="text-cream/80 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold">
                {t("landing.eyebrow")}
              </p>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="font-display text-5xl sm:text-7xl text-cream leading-[1.05] mt-7 drop-shadow-md">
                {t("landing.headline1")}
              </h1>
              <h1 className="font-display text-5xl sm:text-7xl text-golden leading-[1.05] mt-1 drop-shadow-md">
                {t("landing.headline2")}
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-cream/95 text-lg sm:text-xl mt-7 max-w-2xl leading-relaxed">
                {t("landing.subhead")}
              </p>
            </Reveal>

            {/* Multilingual welcome — slim horizontal pill row, instant switch */}
            <Reveal delay={290}>
              <div className="mt-9 flex flex-wrap justify-center gap-2.5">
                {LANGUAGES.map((l) => {
                  const selected = activeLang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => selectLanguage(l.code)}
                      aria-pressed={selected}
                      className={`rounded-full px-5 py-2 text-sm font-semibold
                        transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]
                        ${selected
                          ? "bg-cream text-terra shadow-warm-lg scale-105"
                          : "bg-cream/15 backdrop-blur-sm text-cream border border-cream/35 hover:bg-cream/25"}`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Dual CTAs — equally prominent */}
            <Reveal delay={380}>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 w-full max-w-md sm:max-w-none sm:w-auto justify-center">
                <button
                  onClick={() => router.push("/consent")}
                  className="bg-cream text-terra font-semibold rounded-full px-9 py-4 text-base
                    shadow-warm-xl hover:bg-golden hover:scale-105 active:scale-100 transition-all"
                >
                  {t("landing.cta")} →
                </button>
                <button
                  onClick={() => router.push("/about")}
                  className="border-2 border-cream text-cream font-semibold rounded-full px-9 py-4 text-base
                    hover:bg-cream hover:text-terra active:scale-[0.98] transition-all"
                >
                  {t("landing.browseCta")} →
                </button>
              </div>
            </Reveal>

            <Reveal delay={470}>
              <p className="text-cream/65 text-[11px] mt-10 uppercase tracking-[0.22em]">
                {t("landing.reassurance")}
              </p>
            </Reveal>
          </div>

          {/* Scroll hint */}
          <div className="relative z-10 flex justify-center pb-6">
            <svg
              className="h-5 w-5 text-cream/70 animate-bounce"
              aria-hidden
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-3 text-center">
              {t("landing.how.eyebrow")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-brown text-center leading-tight max-w-2xl mx-auto">
              {t("landing.how.title")}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5 mt-12">
            {HOW_STEPS.map((s, i) => (
              <Reveal key={s} delay={i * 110}>
                <div className="h-full bg-cream-soft rounded-3xl shadow-warm p-7 transition-shadow duration-300 hover:shadow-warm-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-terra text-cream font-display text-xl mb-5 shadow-warm">
                    {i + 1}
                  </div>
                  <h3 className="font-display text-xl text-brown leading-snug mb-2">
                    {t(`landing.how.${s}.title`)}
                  </h3>
                  <p className="text-sm text-brown/75 leading-relaxed">
                    {t(`landing.how.${s}.body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6">
          <StitchDivider tone="gold" />
        </div>

        {/* ─── A PEEK AT THE QUILT ──────────────────────────────── */}
        <section className="bg-cream-soft py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-3">
                {t("landing.peek.eyebrow")}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-brown leading-tight mb-3">
                {t("landing.peek.title")}
              </h2>
              <p className="text-sm text-brown/65 mb-10 max-w-md mx-auto">
                {t("landing.peek.caption")}
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mx-auto rounded-4xl bg-cream-soft border border-cream-deep/60 shadow-warm-lg p-6 sm:p-8">
                <Quilt
                  patches={PEEK_PATCHES}
                  answered={PEEK_PATCHES.length}
                  variant="full"
                  reveal
                  className="mx-auto"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6">
          <StitchDivider tone="gold" />
        </div>

        {/* ─── WHAT'S INSIDE MANDI ──────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-3 text-center">
              {t("landing.inside.eyebrow")}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-brown text-center leading-tight">
              {t("landing.inside.title")}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5 mt-12">
            {DESTINATIONS.map((d, i) => (
              <Reveal key={d.id} delay={Math.min(i, 6) * 70}>
                <Link
                  href={d.href}
                  className={`group block h-full bg-cream-soft rounded-3xl shadow-warm p-7 border-t-4 ${d.accent}
                    transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg`}
                >
                  <h3 className="font-display text-xl text-brown leading-snug mb-2 group-hover:text-terra transition-colors">
                    {t(`landing.inside.${d.id}.title`)}
                  </h3>
                  <p className="text-sm text-brown/70 leading-relaxed mb-4">
                    {t(`landing.inside.${d.id}.body`)}
                  </p>
                  <span className="inline-flex items-center text-sm text-terra font-semibold">
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── VOICES ───────────────────────────────────────────── */}
        <section className="bg-cream-deep/30 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-3 text-center">
                {t("landing.voices.eyebrow")}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-brown text-center leading-tight mb-12">
                {t("landing.voices.title")}
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {VOICES.map((v, i) => (
                <Reveal as="blockquote" key={v.quoteKey} delay={i * 110}>
                  <div className="h-full bg-cream-soft rounded-3xl shadow-warm p-7 border-l-4 border-coral transition-transform duration-300 hover:-translate-y-1">
                    <p className="text-brown/85 text-base leading-relaxed italic mb-5">
                      &ldquo;{t(v.quoteKey)}&rdquo;
                    </p>
                    <p className="text-terra font-semibold text-sm">{v.name}</p>
                    <p className="text-brown/50 text-xs">{v.location}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BUILT WITH CARE ──────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-4">
              {t("landing.built.eyebrow")}
            </p>
          </Reveal>
          <div className="space-y-3 text-brown/80 text-base leading-relaxed">
            <Reveal delay={80}>{t("landing.built.line1")}</Reveal>
            <Reveal delay={150}>{t("landing.built.line2")}</Reveal>
            <Reveal delay={220}>{t("landing.built.line3")}</Reveal>
            <Reveal delay={290}>
              <span className="text-brown/55 text-sm">{t("landing.built.line4")}</span>
            </Reveal>
          </div>
        </section>

        {/* ─── CLOSE ────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk">
          <div className="absolute inset-0 bg-brown/15" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 text-center">
            <Reveal>
              <h2 className="font-display text-4xl sm:text-5xl text-cream leading-tight mb-8">
                {t("landing.close.title")}
              </h2>
              <button
                onClick={() => router.push("/consent")}
                className="bg-cream text-terra font-semibold rounded-full px-10 py-4 text-base
                  shadow-warm-xl hover:bg-golden hover:scale-105 active:scale-100 transition-all"
              >
                {t("landing.close.cta")} →
              </button>
            </Reveal>
          </div>
        </section>

        {/* Tiny footer */}
        <footer className="text-center py-6 px-4">
          <p className="text-brown/50 text-xs">
            JoinMandi.com · MrsKing Productions · Hermi King · March 2026
          </p>
        </footer>
      </main>
    </>
  );
}
