"use client";

/**
 * Language picker for the public NavBar.
 *
 * Previous behaviour cycled EN → ZU → XH → AF → EN on every tap, which
 * forced react-i18next to re-translate the whole page on each click. With
 * four languages, that's three wasted full-page re-renders to switch from
 * EN to AF. Phase 13 replaces it with a real popover: tap chip → list of
 * four → pick one → single `changeLanguage` call. localStorage persists
 * the choice across reloads (mirrors the landing page's existing pattern).
 *
 * Outside-click + Escape close the popover. Keyboard navigable.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type LanguageCode = "en" | "zu" | "xh" | "af";

// Own-language labels (Khuluma noMandi, Thetha noMandi, Praat met Mandi)
// would be too long for a dropdown row; we use the language name in its
// own script instead — same convention as the consent / language pages.
const LANGUAGES: { code: LanguageCode; label: string; tag: string }[] = [
  { code: "en", label: "English", tag: "EN" },
  { code: "zu", label: "isiZulu", tag: "ZU" },
  { code: "xh", label: "isiXhosa", tag: "XH" },
  { code: "af", label: "Afrikaans", tag: "AF" },
];

export default function LanguageMenu() {
  const { i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = (i18n.language?.slice(0, 2).toLowerCase() ?? "en") as LanguageCode;
  const currentTag =
    LANGUAGES.find((l) => l.code === current)?.tag ?? current.toUpperCase();

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code: LanguageCode) => {
    setOpen(false);
    if (code === current) return;
    void i18n.changeLanguage(code);
    try {
      localStorage.setItem("mandi-lang", code);
    } catch {
      /* private-browsing / disabled storage — fall through */
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full font-semibold px-4 py-2 text-sm tracking-[0.12em]
          bg-golden text-brown hover:bg-sun hover:-translate-y-0.5 hover:shadow-warm
          transition-all duration-200 select-none cursor-pointer"
      >
        {currentTag}
        <svg
          aria-hidden
          className={`h-3 w-3 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[180px] bg-cream-soft border border-cream-deep rounded-2xl shadow-warm-xl py-2 z-50"
        >
          {LANGUAGES.map((lang) => {
            const isCurrent = lang.code === current;
            return (
              <button
                key={lang.code}
                role="menuitem"
                onClick={() => pick(lang.code)}
                disabled={isCurrent}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors
                  ${
                    isCurrent
                      ? "text-brown font-semibold cursor-default"
                      : "text-brown/80 hover:bg-golden/20 hover:text-brown"
                  }`}
              >
                <span>{lang.label}</span>
                {isCurrent ? (
                  <svg
                    aria-hidden
                    className="h-4 w-4 text-terra"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5 9-11" />
                  </svg>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-brown/50 font-mono">
                    {lang.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
