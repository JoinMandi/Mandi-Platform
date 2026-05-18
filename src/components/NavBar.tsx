"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createBrowserClient } from "@/server/supabase/browser";
import Button from "@/components/ui/Button";
import LanguageTag from "@/components/ui/LanguageTag";

const LANGUAGES = ["en", "zu", "xh", "af"] as const;
type Locale = (typeof LANGUAGES)[number];

const NAV_LINKS = [
  { href: "/about",              labelKey: "nav.about" },
  { href: "/truth-about-hrt",    labelKey: "nav.hrt" },
  { href: "/resources",          labelKey: "nav.resources" },
  { href: "/find-a-doctor",      labelKey: "nav.doctor" },
  { href: "/honour-the-mothers", labelKey: "nav.mothers" },
  { href: "/events",             labelKey: "nav.events" },
];

export default function NavBar() {
  const { t, i18n } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    void (async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    })();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e: AuthChangeEvent, session: Session | null) => setHasSession(!!session),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cycleLanguage = () => {
    const idx = LANGUAGES.indexOf(i18n.language as Locale);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    void i18n.changeLanguage(next);
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-md transition-shadow duration-300
        ${scrolled ? "shadow-warm" : "shadow-none"} border-b border-cream-deep/40`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={92}
              height={28}
              className="[filter:invert(23%)_sepia(46%)_saturate(1800%)_hue-rotate(340deg)_brightness(88%)]"
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-brown/80 hover:text-terra transition-colors font-medium"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {hasSession && (
              <Link
                href="/my-journey"
                className="text-sm text-brown/80 hover:text-terra transition-colors font-medium"
              >
                {t("nav.journey")}
              </Link>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageTag
              label={i18n.language?.slice(0, 2).toUpperCase() ?? "EN"}
              onClick={cycleLanguage}
            />
            {!hasSession && (
              <Link
                href="/auth/login"
                className="text-sm text-brown/70 hover:text-terra font-medium px-2"
              >
                {t("nav.login")}
              </Link>
            )}
            <Button variant="primary" size="sm" onClick={() => (window.location.href = "/find-a-doctor")}>
              {t("nav.book")}
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden relative w-10 h-10 text-brown"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 w-6 h-0.5 bg-brown rounded-full"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-brown rounded-full"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 w-6 h-0.5 bg-brown rounded-full"
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-cream-soft border-t border-cream-deep/40 px-5 py-5 flex flex-col gap-1 shadow-warm-lg"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra transition-colors"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {hasSession && (
              <Link
                href="/my-journey"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium"
              >
                {t("nav.journey")}
              </Link>
            )}
            <div className="flex items-center justify-between gap-3 pt-4">
              <LanguageTag
                label={i18n.language?.slice(0, 2).toUpperCase() ?? "EN"}
                onClick={cycleLanguage}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.location.href = "/find-a-doctor";
                  setMenuOpen(false);
                }}
              >
                {t("nav.book")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
