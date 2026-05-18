"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";

const LANGUAGES = [
  { code: "en", label: "Talk to Mandi",    sub: "English"   },
  { code: "zu", label: "Khuluma noMandi",  sub: "isiZulu"   },
  { code: "xh", label: "Thetha noMandi",   sub: "isiXhosa"  },
  { code: "af", label: "Praat met Mandi",  sub: "Afrikaans" },
];

export default function LanguagePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");

  const handleSelect = (code: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-lang", code);
    }
    void i18n.changeLanguage(code);
    router.push("/consent");
  };

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/55" />
        <div className="relative z-10 flex items-center justify-center px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-terra font-semibold text-center mb-2">
              {t("brand.name")}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-brown text-center mb-3">
              {t("language.prompt")}
            </h1>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {LANGUAGES.map((l) => (
                <motion.button
                  key={l.code}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(l.code)}
                  className="bg-white hover:bg-terra hover:text-cream text-brown rounded-2xl px-4 py-5
                    border-2 border-coral/30 hover:border-terra transition-colors flex flex-col items-center gap-0.5 shadow-warm"
                >
                  <span className="font-semibold text-sm">{l.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] opacity-70">{l.sub}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
