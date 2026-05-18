"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "Talk to Mandi",      sub: "English"   },
  { code: "zu", label: "Khuluma noMandi",    sub: "isiZulu"   },
  { code: "xh", label: "Thetha noMandi",     sub: "isiXhosa"  },
  { code: "af", label: "Praat met Mandi",    sub: "Afrikaans" },
];

export default function LandingPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const [selected, setSelected] = useState<string>("en");

  const handleBegin = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-lang", selected);
    }
    void i18n.changeLanguage(selected);
    router.push("/consent");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-mandi-gradient">
      {/* Drifting ambient blobs for warmth */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ y: [-12, 12, -12], x: [-8, 8, -8] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-80 h-80 rounded-full blur-3xl opacity-60"
          style={{ background: "radial-gradient(circle, #F2C14E 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ y: [10, -14, 10], x: [6, -10, 6] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 right-16 w-96 h-96 rounded-full blur-3xl opacity-55"
          style={{ background: "radial-gradient(circle, #E66C84 0%, transparent 70%)" }}
        />
      </div>

      {/* Thin top nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Image
          src="/Mandi_Logo.svg"
          alt="Mandi"
          width={100}
          height={30}
          priority
          className="brightness-0 invert opacity-95"
        />
        <nav className="hidden sm:flex items-center gap-6 text-sm text-cream/85 font-medium">
          <Link href="/about" className="hover:text-cream transition-colors">{t("nav.about")}</Link>
          <Link href="/truth-about-hrt" className="hover:text-cream transition-colors">{t("nav.hrt")}</Link>
          <Link href="/honour-the-mothers" className="hover:text-cream transition-colors">{t("nav.mothers")}</Link>
          <Link href="/events" className="hover:text-cream transition-colors">{t("nav.events")}</Link>
        </nav>
        <Link
          href="/about"
          className="sm:hidden text-cream/85 text-sm font-medium"
        >
          Browse →
        </Link>
      </header>

      {/* Centre card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-5 pt-6 pb-16 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <div className="bg-cream-soft/95 backdrop-blur-sm rounded-5xl shadow-warm-xl px-7 sm:px-10 py-10 sm:py-12 flex flex-col items-center gap-7">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={120}
              height={35}
              priority
              className="[filter:invert(23%)_sepia(46%)_saturate(1800%)_hue-rotate(340deg)_brightness(88%)]"
            />

            {/* Eyebrow */}
            <p className="text-[11px] uppercase tracking-[0.22em] text-terra font-semibold text-center">
              {t("landing.eyebrow")}
            </p>

            {/* Headline — Carmos display */}
            <div className="text-center space-y-1">
              <h1 className="font-display text-3xl sm:text-[2.25rem] leading-[1.1] text-brown">
                {t("landing.headline1")}
              </h1>
              <h1 className="font-display text-3xl sm:text-[2.25rem] leading-[1.1] text-terra">
                {t("landing.headline2")}
              </h1>
            </div>

            <p className="text-sm text-brown/70 text-center leading-relaxed px-2">
              {t("landing.subhead")}
            </p>

            {/* Language tiles — 2x2 on mobile, 2x2 on desktop (four equal) */}
            <div className="w-full grid grid-cols-2 gap-2.5">
              {LANGUAGES.map((l) => (
                <motion.button
                  key={l.code}
                  type="button"
                  onClick={() => setSelected(l.code)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-2xl border-2 px-3 py-3.5 flex flex-col items-center gap-0.5
                    transition-colors
                    ${selected === l.code
                      ? "bg-terra text-cream border-terra shadow-warm-lg"
                      : "bg-white text-brown border-coral/25 hover:border-terra"}`}
                >
                  <span className="font-semibold text-sm leading-tight">{l.label}</span>
                  <span className={`text-[10px] uppercase tracking-[0.15em] ${selected === l.code ? "text-cream/70" : "text-brown/45"}`}>
                    {l.sub}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Primary CTA */}
            <motion.button
              onClick={handleBegin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-terra text-cream font-semibold rounded-full px-8 py-4 text-base
                shadow-warm-lg hover:bg-terra-dark transition-colors"
            >
              {t("landing.cta")} →
            </motion.button>

            <Link
              href="/about"
              className="text-xs text-brown/55 font-medium hover:text-terra transition-colors"
            >
              {t("landing.browse")} →
            </Link>

            <p className="text-[11px] text-brown/40 text-center leading-relaxed">
              {t("landing.reassurance")}
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 text-center pb-6 px-4">
        <p className="text-cream/60 text-xs">
          JoinMandi.com · MrsKing Productions · Hermi King · March 2026
        </p>
      </footer>
    </div>
  );
}
