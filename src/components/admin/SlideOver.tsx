"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface SlideOverProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg";
}

export default function SlideOver({
  open,
  title,
  onClose,
  children,
  footer,
  width = "md",
}: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const widthClass = width === "lg" ? "max-w-xl" : "max-w-md";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-brown-deep/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className={`fixed right-0 top-0 bottom-0 z-50 w-full ${widthClass} bg-cream-soft shadow-warm-xl flex flex-col`}
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-cream-deep/50">
              <h2 className="font-display text-xl text-brown">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-brown/5 hover:bg-brown/10 flex items-center justify-center text-brown"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && (
              <footer className="border-t border-cream-deep/50 px-6 py-4 bg-cream">
                {footer}
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
