"use client";

import { Fragment, useEffect, useState } from "react";
import i18n, { LANG_STORAGE_KEY } from "@/lib/i18n";

const SUPPORTED = ["en", "zu", "xh", "af"];

/**
 * i18n bootstrap, hydration-safe.
 *
 * Server + first client render: language is always "en" (set in `lib/i18n.ts`),
 * so SSR HTML matches the first client render — no hydration mismatch warnings.
 * After mount we read the saved language from localStorage and call
 * `i18n.changeLanguage(...)`. Children are keyed by the current language so a
 * change triggers a clean re-mount, guaranteeing every translated element picks
 * up the new strings (useTranslation alone has been unreliable here).
 */
export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    // Subscribe to any language change (NavBar tag, landing tiles, here).
    const onChange = (lng: string) => setLang(lng);
    i18n.on("languageChanged", onChange);

    // Restore from localStorage as soon as i18n is initialised.
    const restore = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      } catch {
        /* localStorage may be unavailable (privacy mode) */
      }
      if (saved && SUPPORTED.includes(saved) && saved !== i18n.language) {
        void i18n.changeLanguage(saved);
      }
    };
    if (i18n.isInitialized) restore();
    else i18n.on("initialized", restore);

    return () => {
      i18n.off("languageChanged", onChange);
      i18n.off("initialized", restore);
    };
  }, []);

  return <Fragment key={lang}>{children}</Fragment>;
}
