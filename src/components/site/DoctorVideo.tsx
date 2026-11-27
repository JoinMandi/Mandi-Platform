"use client";

import { useState } from "react";

const VIDEOS = {
  en: "/videos/mandi-for-doctors-en.mp4",
  af: "/videos/mandi-for-doctors-af.mp4",
} as const;

const POSTERS = {
  en: "/videos/mandi-for-doctors-en-poster.jpg",
  af: "/videos/mandi-for-doctors-af-poster.jpg",
} as const;

type VideoLanguage = keyof typeof VIDEOS;

/**
 * Inline doctor introduction. The language switch changes the source and
 * poster in place; the native video controls play it inside the card.
 */
export default function DoctorVideo() {
  const [language, setLanguage] = useState<VideoLanguage>("en");

  return (
    <figure id="video" className="w-full min-w-0 xl:flex-[999_1_560px]">
      <div className="relative overflow-hidden rounded-[20px] bg-brown shadow-[0_30px_60px_rgba(103,60,51,0.3)]">
        <video
          key={language}
          src={VIDEOS[language]}
          poster={POSTERS[language]}
          controls
          preload="metadata"
          playsInline
          aria-label={`Mandi for doctors — ${language === "en" ? "English" : "Afrikaans"}`}
          className="aspect-video w-full bg-brown object-cover"
        />

        <div
          role="group"
          aria-label="Video language"
          className="absolute right-4 top-4 z-10 flex gap-0.5 rounded-full border border-[#FFF5E6]/30 bg-[#2C1810]/55 p-1 text-[10px] font-bold backdrop-blur-sm sm:right-[26px] sm:top-[24px] sm:text-[13px]"
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
      </div>

      <figcaption className="mt-4 text-sm leading-relaxed">
        Five minutes on why menopause is hard to get right in South Africa, what
        Mandi does before she reaches you, and who pays for what.
      </figcaption>
    </figure>
  );
}
