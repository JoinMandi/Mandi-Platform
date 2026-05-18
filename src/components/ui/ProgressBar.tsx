"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ProgressBarProps {
  current: number;
  total: number;
  variant?: "top" | "inline";
}

export default function ProgressBar({
  current,
  total,
  variant = "inline",
}: ProgressBarProps) {
  const { t } = useTranslation("common");
  const percentage = Math.max(0, Math.min(100, (current / total) * 100));

  if (variant === "top") {
    return (
      <div className="fixed top-0 left-0 right-0 z-30 h-1 bg-cream-deep/50 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-coral via-pink-mandi to-terra"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-[11px] uppercase tracking-[0.18em] text-brown/50 mb-2 font-semibold">
        {t("questionnaire.progress", { current, total })}
      </p>
      <div className="w-full bg-cream-deep/60 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-coral via-pink-mandi to-terra rounded-full"
        />
      </div>
    </div>
  );
}
