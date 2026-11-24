"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const WORDS = ["praat met", "talk to", "khuluma no", "thetha no"];
const DURATION_MS = 6000;

/**
 * The Arrive welcome: at least six seconds, four languages rotating every
 * 1.5s, a thin progress bar that keeps moving if loading is slow.
 */
export default function WelcomeSplash({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation("common");
  const [word, setWord] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const words = window.setInterval(
      () => setWord((w) => (w + 1) % WORDS.length),
      1500,
    );
    const bar = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - started) / DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(bar);
        window.clearInterval(words);
        onDone();
      }
    }, 50);
    return () => {
      window.clearInterval(words);
      window.clearInterval(bar);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-mandi-gradient px-6 text-center"
    >
      <div className="pointer-events-none absolute inset-0 bg-brown/10" />
      <div className="relative z-10 flex flex-col items-center">
        <p
          key={word}
          className="mb-4 animate-fade-in font-display text-3xl text-golden sm:text-4xl"
        >
          {WORDS[word]}
        </p>
        <Image
          src="/Mandi_Logo.svg"
          alt="Mandi"
          width={190}
          height={58}
          priority
          className="brightness-0 invert drop-shadow-md"
        />
        <p className="mt-8 max-w-sm text-sm leading-relaxed text-cream/85 sm:text-base">
          {t("splash.tagline", {
            defaultValue: "Your companion through menopause and hormone health",
          })}
        </p>
        <div className="mt-10 h-1 w-44 overflow-hidden rounded-full bg-cream/20">
          <div
            className="h-full rounded-full bg-golden"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
