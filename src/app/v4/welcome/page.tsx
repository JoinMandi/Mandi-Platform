"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const WORDS = ["praat met", "talk to", "khuluma no", "thetha no"];
const DURATION = 6000;

export default function V4Welcome() {
  const router = useRouter();
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
      const pct = Math.min(100, ((Date.now() - started) / DURATION) * 100);
      setProgress(pct);
      if (pct >= 100) {
        window.clearInterval(bar);
        window.clearInterval(words);
        router.push("/v4/language");
      }
    }, 50);
    return () => {
      window.clearInterval(words);
      window.clearInterval(bar);
    };
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-mandi-welcome px-6 py-10 text-center">
      <div className="flex h-12 items-end justify-center">
        <p key={word} className="font-word text-4xl font-extrabold leading-none text-brown-warm sm:text-6xl">
          {WORDS[word]}
        </p>
      </div>
      <Image
        src="/brand/mandi-v4-logo.png"
        alt="Mandi"
        width={270}
        height={120}
        priority
        className="h-auto w-56 sm:w-72"
      />
      <p className="max-w-xs text-base font-semibold leading-snug text-brown-warm">
        {t("v4.welcome.tagline")}
      </p>
      <div className="mt-4 h-1.5 w-36 overflow-hidden rounded-full bg-brown-warm/20">
        <div className="h-full rounded-full bg-brown-warm" style={{ width: `${progress}%` }} />
      </div>
    </main>
  );
}
