"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/ui/Reveal";
import PetalBurst from "@/components/ui/PetalBurst";

const LANGUAGES = [
  { code: "en", label: "Talk to Mandi",    sub: "English"   },
  { code: "zu", label: "Khuluma noMandi",  sub: "isiZulu"   },
  { code: "xh", label: "Thetha noMandi",   sub: "isiXhosa"  },
  { code: "af", label: "Praat met Mandi",  sub: "Afrikaans" },
];

export default function LanguagePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const [bursting, setBursting] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    if (bursting) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-lang", code);
    }
    void i18n.changeLanguage(code);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      router.push("/consent");
      return;
    }
    // A small petal bloom on the chosen tile, then onward.
    setBursting(code);
    window.setTimeout(() => router.push("/consent"), 460);
  };

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/55" />
        <div className="relative z-10 flex items-center justify-center px-5 py-16">
          <div className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10">
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold text-center mb-2">
                {t("brand.name")}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-brown text-center mb-3">
                {t("language.prompt")}
              </h1>
            </Reveal>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {LANGUAGES.map((l, i) => {
                const isBursting = bursting === l.code;
                return (
                  <Reveal key={l.code} variant="stitch" delay={i * 70}>
                    <button
                      onClick={() => handleSelect(l.code)}
                      className={`relative w-full overflow-visible rounded-2xl px-4 py-5 border-2
                        flex flex-col items-center gap-0.5 shadow-warm transition-all duration-200
                        hover:-translate-y-0.5 active:scale-95
                        ${isBursting
                          ? "bg-terra text-cream border-terra"
                          : "bg-white text-brown border-coral/30 hover:bg-terra hover:text-cream hover:border-terra"}`}
                    >
                      <span className="font-semibold text-sm">{l.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.15em] opacity-70">{l.sub}</span>
                      {isBursting && <PetalBurst />}
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
