"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import Reveal from "@/components/ui/Reveal";
import { recordConsent } from "@/server/actions/consent";

export default function ConsentPage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const { t } = useTranslation("common");

  const handleBegin = async () => {
    if (!ageConfirmed || !agreed) return;
    const lang = typeof window !== "undefined" ? localStorage.getItem("mandi-lang") : null;
    try {
      // Durable, auditable POPIA consent record (localStorage alone isn't
      // accountable). Keep the session id so the questionnaire links to it.
      const sessionId = await recordConsent(lang);
      if (sessionId && typeof window !== "undefined") {
        localStorage.setItem("mandi-session", sessionId);
      }
    } catch {
      /* best-effort — proceed even if the consent record fails to persist */
    }
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
        <div className="absolute inset-0 bg-cream/40" />

        <div className="relative z-10 flex items-center justify-center px-5 py-16 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-12 flex flex-col gap-7">
            <Reveal delay={0}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold mb-3">
                {t("brand.name")}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-brown leading-tight mb-5">
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
              <div className="flex flex-col gap-4">
                <ConsentCheckbox
                  label={t("consent.age")}
                  checked={ageConfirmed}
                  onChange={setAgeConfirmed}
                  required
                />
                <ConsentCheckbox
                  label={t("consent.checkbox")}
                  checked={agreed}
                  onChange={setAgreed}
                  required
                />
              </div>
            </Reveal>

            <Reveal delay={260}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => void handleBegin()}
                disabled={!ageConfirmed || !agreed}
                className={`w-full ${ageConfirmed && agreed ? "animate-pulse-warm" : ""}`}
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
