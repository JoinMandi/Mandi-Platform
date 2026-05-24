"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Quilt from "./Quilt";
import type { QuiltPatch } from "@/lib/domain/quilt";

interface TransitionScreenProps {
  patches: QuiltPatch[];
  onDone: () => void;
}

const STAGE_MS = 1100;
const STAGE_KEYS = ["1", "2", "3", "4"];
const PETAL_COLORS = ["#F2C14E", "#F07B54", "#E66C84", "#F5A623", "#C94A2B"];

function Bloom() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: `calc(50% + ${Math.cos(angle) * 12}px)`,
              top: `calc(44% + ${Math.sin(angle) * 12}px)`,
              animation: `bloom 2.4s ease-out ${i * 90}ms forwards`,
            }}
          >
            {/* a petal — three rounded corners, one point — echoing the floral weave */}
            <span
              className="block h-3.5 w-3.5"
              style={{
                background: PETAL_COLORS[i % PETAL_COLORS.length],
                borderRadius: "50% 50% 50% 0",
                transform: `rotate(${angle + Math.PI / 4}rad)`,
              }}
            />
          </span>
        );
      })}
    </div>
  );
}

export default function TransitionScreen({ patches, onDone }: TransitionScreenProps) {
  const { t } = useTranslation("common");
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGE_KEYS.length - 1) {
      const timer = window.setTimeout(onDone, STAGE_MS + 400);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => window.clearTimeout(timer);
  }, [stage, onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-mandi-gradient px-5 py-12">
      <div className="pointer-events-none absolute inset-0 bg-brown/20" />
      <Bloom />

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto rounded-5xl border border-cream/25 bg-cream-soft/95 p-6 shadow-warm-xl">
          <Quilt patches={patches} answered={patches.length} variant="full" reveal className="mx-auto" />
        </div>
        <p
          key={stage}
          className="mt-7 animate-fade-in font-display text-2xl text-cream drop-shadow-md sm:text-3xl"
        >
          {t(`questionnaire.loadingStages.${STAGE_KEYS[stage]}`)}
        </p>
        <p className="mt-2 text-sm font-medium text-cream/85">
          {t("questionnaire.blanketComplete")}
        </p>
      </div>
    </div>
  );
}
