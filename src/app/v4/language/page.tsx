"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", name: "English", cta: "Talk to Mandi" },
  { code: "zu", name: "isiZulu", cta: "Khuluma noMandi" },
  { code: "xh", name: "isiXhosa", cta: "Thetha noMandi" },
  { code: "af", name: "Afrikaans", cta: "Praat met Mandi" },
] as const;

export default function V4Language() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
  const [selected, setSelected] = useState<string>("en");

  // Keep the highlighted language in step with the saved choice (the header
  // language pills set it before this screen mounts).
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("mandi-lang");
    } catch {
      /* private browsing */
    }
    const current = (saved || i18n.language || "en").slice(0, 2);
    if (LANGUAGES.some((language) => language.code === current)) {
      setSelected(current);
    }
  }, [i18n.language]);

  const choose = (code: string) => {
    setSelected(code);
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-lang", code);
    }
    void i18n.changeLanguage(code);
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-5 sm:px-8 sm:py-8">
        <Image src="/brand/mandi-v4-logo.png" alt="Mandi" width={72} height={32} className="h-8 w-auto self-start" />

        <h1 className="mt-8 max-w-md font-display text-3xl font-bold leading-tight text-brown sm:text-4xl">
          {t("v4.language.title")}
        </h1>
        <p className="mt-2 text-sm text-brown-soft">{t("v4.language.sub")}</p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {LANGUAGES.map((language) => {
            const isSelected = selected === language.code;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => choose(language.code)}
                className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-4 text-left text-base font-semibold transition-colors ${
                  isSelected
                    ? "border-coral bg-gradient-to-r from-cream-soft to-blush"
                    : "border-cream-deep bg-white hover:border-coral"
                }`}
              >
                <span>{language.name}</span>
                <span className={`text-xs font-medium ${isSelected ? "text-terra-dark" : "text-brown-soft"}`}>
                  {language.cta}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />
        <button
          type="button"
          onClick={() => router.push("/v4")}
          className="mt-8 w-full rounded-full bg-mandi-button px-8 py-4 text-base font-bold text-brown shadow-[0_8px_18px_rgba(244,123,76,0.35)]"
        >
          {selected === "af" ? t("v4.language.continueAf") : t("v4.language.continue")}
        </button>
      </div>
    </main>
  );
}
