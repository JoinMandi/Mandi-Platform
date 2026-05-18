"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { QuestionDomain } from "@/lib/domain/questions";

interface DomainTransitionProps {
  domain: QuestionDomain;
  durationMs?: number;
  onDone: () => void;
}

// soft-glow accent colour for each domain — pulls from Mandi Blanket palette
const DOMAIN_ACCENTS: Record<QuestionDomain, { from: string; to: string }> = {
  context:        { from: "#F2C14E", to: "#F07B54" },
  "mind-cognition":{ from: "#F2C14E", to: "#F5A623" },
  mood:           { from: "#E66C84", to: "#C94A2B" },
  "nervous-system":{ from: "#F07B54", to: "#E66C84" },
  body:           { from: "#F5A623", to: "#C94A2B" },
  urogenital:     { from: "#E66C84", to: "#2C1810" },
  other:          { from: "#F2C14E", to: "#E66C84" },
  "quality-of-life":{ from: "#F07B54", to: "#F2C14E" },
  mindset:        { from: "#2C1810", to: "#C94A2B" },
};

export default function DomainTransition({
  domain,
  durationMs = 1800,
  onDone,
}: DomainTransitionProps) {
  const { t } = useTranslation("common");
  const accent = DOMAIN_ACCENTS[domain];

  useEffect(() => {
    const timer = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(timer);
  }, [onDone, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 30% 20%, ${accent.from}AA 0%, transparent 55%),
                     radial-gradient(ellipse at 75% 85%, ${accent.to}CC 0%, transparent 65%),
                     linear-gradient(160deg, #FDF6EC 0%, #EADFD1 60%, ${accent.from}33 100%)`,
      }}
    >
      {/* soft pulse halo */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.9, 1.1, 0.95], opacity: [0.3, 0.55, 0.4] }}
        transition={{ duration: durationMs / 1000, ease: "easeInOut" }}
      >
        <div
          className="w-[70vmin] h-[70vmin] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${accent.from} 0%, transparent 70%)`,
          }}
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-xl px-8 text-center"
      >
        <motion.p
          initial={{ letterSpacing: "0.02em", opacity: 0 }}
          animate={{ letterSpacing: "0.18em", opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-xs sm:text-sm uppercase font-semibold text-brown/60 mb-4"
        >
          {t(`questionnaire.domain.${domain}.title`)}
        </motion.p>
        <h2 className="font-display text-3xl sm:text-5xl text-brown leading-tight mb-4">
          {t(`questionnaire.domain.${domain}.title`)}
        </h2>
        <p className="text-brown/75 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          {t(`questionnaire.domain.${domain}.description`)}
        </p>
      </motion.div>
    </motion.div>
  );
}
