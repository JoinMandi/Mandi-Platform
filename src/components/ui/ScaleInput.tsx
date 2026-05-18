"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface ScaleInputProps {
  value: number | null;
  onChange: (value: number) => void;
  allowNotApplicable?: boolean;
  notApplicableValue?: string | number;
  notApplicableSelected?: boolean;
  onNotApplicable?: () => void;
}

const SCALE_VALUES = [0, 1, 2, 3] as const;

export default function ScaleInput({
  value,
  onChange,
  allowNotApplicable = false,
  notApplicableSelected = false,
  onNotApplicable,
}: ScaleInputProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SCALE_VALUES.map((v) => {
          const isSelected = value === v && !notApplicableSelected;
          const anotherSelected =
            (value !== null && value !== v) || notApplicableSelected;
          return (
            <motion.button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              animate={{
                scale: isSelected ? 1.06 : 1,
                opacity: anotherSelected && !isSelected ? 0.55 : 1,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-5 rounded-2xl
                border-2 text-sm font-semibold overflow-hidden
                ${isSelected
                  ? "bg-terra text-cream border-terra shadow-warm-lg"
                  : "bg-cream-soft border-coral/30 text-brown hover:border-terra"}`}
            >
              <span className="font-display text-3xl leading-none">{v}</span>
              <span className="text-[11px] text-center leading-tight opacity-90">
                {t(`questionnaire.scale.${v}`)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {allowNotApplicable && (
        <motion.button
          type="button"
          onClick={onNotApplicable}
          animate={{
            scale: notApplicableSelected ? 1.02 : 1,
            opacity: value !== null && !notApplicableSelected ? 0.55 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          whileTap={{ scale: 0.98 }}
          className={`self-center text-xs font-medium px-5 py-2 rounded-full border
            transition-colors
            ${notApplicableSelected
              ? "bg-brown text-cream border-brown"
              : "bg-transparent text-brown/60 border-brown/20 hover:text-brown hover:border-brown/50"}`}
        >
          {t("questionnaire.notApplicable")}
        </motion.button>
      )}
    </div>
  );
}
