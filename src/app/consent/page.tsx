"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import Reveal from "@/components/ui/Reveal";

export default function ConsentPage() {
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleBegin = () => {
    if (!agreed) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-consent", new Date().toISOString());
    }
    router.push("/questionnaire");
  };

  return (
    <>
      <NavBar />
      <main className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/70" />

        <div className="relative z-10 flex items-center justify-center px-5 py-16 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-12 flex flex-col gap-7">
            <Reveal delay={0}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold mb-3">
                POPIA
              </p>
              <h1 className="font-display text-2xl sm:text-3xl text-brown leading-tight mb-5">
                {t("consent.title")}
              </h1>
              <p className="text-brown/80 text-sm sm:text-base leading-relaxed mb-4">
                {t("consent.body")}
              </p>
              <p className="text-brown/70 text-sm leading-relaxed">
                {t("consent.body2")}
              </p>
            </Reveal>

            <Reveal delay={90}>
              <div className="bg-golden/15 border-l-4 border-golden rounded-r-2xl px-5 py-4">
                <p className="text-sm sm:text-base text-brown font-semibold">
                  {t("consent.control")}
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <ConsentCheckbox
                label={t("consent.checkbox")}
                checked={agreed}
                onChange={setAgreed}
                required
              />
            </Reveal>

            <Reveal delay={260}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleBegin}
                disabled={!agreed}
                className={`w-full ${agreed ? "animate-pulse-warm" : ""}`}
              >
                {t("consent.cta")} →
              </Button>
            </Reveal>
          </div>
        </div>
      </main>
    </>
  );
}
