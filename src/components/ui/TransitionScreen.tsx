"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const GRADIENT_CLASSES = [
  "bg-mandi-gradient",
  "bg-mandi-gradient-soft",
  "bg-mandi-gradient-dusk",
  "bg-mandi-gradient",
  "bg-mandi-gradient-soft",
];

interface TransitionScreenProps {
  onDone: () => void;
  durationMs?: number;
}

export default function TransitionScreen({
  onDone,
  durationMs = 3600,
}: TransitionScreenProps) {
  const { t } = useTranslation("common");
  const [gradientIdx, setGradientIdx] = useState(0);

  useEffect(() => {
    const cycle = window.setInterval(() => {
      setGradientIdx((i) => (i + 1) % GRADIENT_CLASSES.length);
    }, 1200);
    const finish = window.setTimeout(onDone, durationMs);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(finish);
    };
  }, [onDone, durationMs]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={gradientIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={`absolute inset-0 ${GRADIENT_CLASSES[gradientIdx]}`}
        />
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="text-center max-w-md">
          <motion.div
            aria-hidden
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: [0.9, 1.1, 0.95], opacity: [0.4, 0.75, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto mb-8 w-20 h-20 rounded-full bg-cream/40 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-golden via-pink-mandi to-terra"
            />
          </motion.div>

          <motion.p
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-2xl sm:text-3xl text-cream drop-shadow-md leading-snug"
          >
            {t("transition.message")}
          </motion.p>
          <p className="mt-3 text-sm text-cream/80 font-medium">
            {t("transition.submessage")}
          </p>
        </div>
      </div>
    </div>
  );
}
