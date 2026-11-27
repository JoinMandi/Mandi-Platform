"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const VIDEOS = {
  en: "/videos/mandi-for-doctors-en.mp4",
  af: "/videos/mandi-for-doctors-af.mp4",
} as const;

type VideoLanguage = keyof typeof VIDEOS;

/**
 * The doctor introduction poster. The player offers the English or Afrikaans
 * narration. Both versions use the same English-designed visual system; only
 * the Afrikaans audio and on-screen copy differ.
 */
export default function DoctorVideo() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<VideoLanguage>("en");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <figure id="video" className="w-full min-w-0 xl:flex-[999_1_560px]">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#2C1810_0%,#673C33_70%,#8A4A35_100%)] shadow-[0_30px_60px_rgba(103,60,51,0.3)]">
          <Image
            src="/brand/mandi-v4-logo.png"
            alt=""
            width={72}
            height={32}
            className="absolute left-4 top-4 h-auto w-14 opacity-95 sm:left-[30px] sm:top-[26px] sm:w-[72px]"
          />
          <div
            role="group"
            aria-label="Video language"
            className="absolute right-4 top-4 flex gap-0.5 rounded-full border border-[#FFF5E6]/30 bg-[#FFF5E6]/15 p-1 text-[10px] font-bold sm:right-[26px] sm:top-[24px] sm:text-[13px]"
          >
            {(
              [
                ["en", "English"],
                ["af", "Afrikaans"],
              ] as const
            ).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                className={`rounded-full px-2.5 py-1.5 sm:px-3.5 sm:py-2 ${
                  language === code
                    ? "bg-sun text-brown"
                    : "bg-transparent text-[#FFF5E6]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Play Mandi for doctors, 4 minutes 43 seconds"
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#FFF5E6]/70 bg-[#FFF5E6]/10 transition-colors hover:bg-[#FFF5E6]/20 sm:h-[88px] sm:w-[88px]"
          >
            <svg aria-hidden viewBox="0 0 24 24" fill="#FFF5E6" className="h-6 w-6 sm:h-[30px] sm:w-[30px]">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <span className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1 text-[#FFF5E6] sm:bottom-[26px] sm:left-[30px]">
            <span className="text-[9px] font-bold tracking-[0.18em] text-sun sm:text-[11px] sm:tracking-[0.22em]">
              AN INTRODUCTION FOR DOCTORS
            </span>
            <span className="text-lg font-bold sm:text-2xl">Mandi for doctors</span>
          </span>
          <span className="pointer-events-none absolute bottom-4 right-4 text-sm font-semibold text-[#FFF5E6]/85 sm:bottom-[30px] sm:right-7">
            4:43
          </span>
        </div>
        <figcaption className="mt-4 text-sm leading-relaxed">
          Five minutes on why menopause is hard to get right in South Africa, what
          Mandi does before she reaches you, and who pays for what.
        </figcaption>
      </figure>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mandi for doctors"
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown/85 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-cream p-3 shadow-warm-xl sm:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close video"
              className="absolute -top-11 right-0 rounded-full bg-cream px-4 py-2 text-sm font-bold text-brown sm:-top-12"
            >
              Close
            </button>

            <div
              role="group"
              aria-label="Video language"
              className="mb-3 flex items-center gap-2"
            >
              {(
                [
                  ["en", "English"],
                  ["af", "Afrikaans"],
                ] as const
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  aria-pressed={language === code}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    language === code
                      ? "bg-brown text-[#FFF5E6]"
                      : "bg-white text-brown hover:bg-blush"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <video
              key={language}
              src={VIDEOS[language]}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-xl bg-brown"
            />
          </div>
        </div>
      )}
    </>
  );
}
