"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/ui/Button";
import LanguageMenu from "@/components/ui/LanguageMenu";
import type { UserRole } from "@/lib/types/database";

const NAV_LINKS = [
  { href: "/about",              labelKey: "nav.about" },
  { href: "/truth-about-hrt",    labelKey: "nav.hrt" },
  { href: "/resources",          labelKey: "nav.resources" },
  { href: "/find-a-doctor",      labelKey: "nav.doctor" },
  { href: "/honour-the-mothers", labelKey: "nav.mothers" },
  { href: "/events",             labelKey: "nav.events" },
];

// A nav link with a warm sliding underline on hover. whitespace-nowrap keeps
// the longer isiZulu / isiXhosa / Afrikaans labels on one line.
const LINK_CLASS =
  "relative whitespace-nowrap text-sm text-brown/80 hover:text-terra transition-colors font-medium " +
  "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-terra " +
  "after:origin-left after:scale-x-0 after:transition-transform after:duration-300 " +
  "after:content-[''] hover:after:scale-x-100";

export default function NavBar() {
  const { t } = useTranslation("common");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Whether to surface the admin link. Admin AND superadmin both belong
  // to the admin tier — superadmin is a strict superset.
  const isAdminTier = role === "admin" || role === "superadmin";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (cancelled) return;
        if (!response.ok) {
          setHasSession(false);
          setRole(null);
          return;
        }
        const data = (await response.json()) as {
          signedIn?: boolean;
          role?: UserRole | null;
        };
        setHasSession(!!data.signedIn);
        setRole(data.role ?? null);
      } catch {
        if (!cancelled) {
          setHasSession(false);
          setRole(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = () => {
    setMenuOpen(false);
    window.location.href = "/auth/logout";
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-cream/95 backdrop-blur-md transition-shadow duration-300
        ${scrolled ? "shadow-warm" : "shadow-none"} border-b border-cream-deep/40`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 transition-transform hover:scale-105">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={92}
              height={28}
              className="[filter:invert(23%)_sepia(46%)_saturate(1800%)_hue-rotate(340deg)_brightness(88%)]"
            />
          </Link>

          {/* Desktop nav — shown once there is room for the longer languages */}
          <div className="hidden xl:flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={LINK_CLASS}>
                {t(link.labelKey)}
              </Link>
            ))}
            {hasSession && (
              <Link href="/my-journey" className={LINK_CLASS}>
                {t("nav.journey")}
              </Link>
            )}
            {isAdminTier && (
              <Link href="/admin" className={LINK_CLASS}>
                {t("nav.admin")}
              </Link>
            )}
          </div>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <LanguageMenu />
            {!hasSession ? (
              <Link
                href="/auth/login"
                className="whitespace-nowrap text-sm text-brown/70 hover:text-terra font-medium px-2 transition-colors"
              >
                {t("nav.login")}
              </Link>
            ) : (
              <button
                onClick={signOut}
                className="whitespace-nowrap text-sm text-brown/70 hover:text-terra font-medium px-2 transition-colors"
              >
                {t("nav.signOut")}
              </button>
            )}
            <Button variant="primary" size="sm" onClick={() => (window.location.href = "/find-a-doctor")}>
              {t("nav.book")}
            </Button>
          </div>

          {/* Mobile hamburger — CSS-morphed, no JS animation engine needed */}
          <button
            className="xl:hidden flex flex-col items-center justify-center gap-1.5 w-10 h-10 flex-shrink-0"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span
              className={`block h-0.5 w-6 rounded-full bg-brown transition-transform duration-200
                ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-brown transition-opacity duration-150
                ${menuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`block h-0.5 w-6 rounded-full bg-brown transition-transform duration-200
                ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="xl:hidden bg-cream-soft border-t border-cream-deep/40 px-5 py-5 flex flex-col gap-1 shadow-warm-lg">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra hover:pl-1 transition-all"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          {hasSession && (
            <Link
              href="/my-journey"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra hover:pl-1 transition-all"
            >
              {t("nav.journey")}
            </Link>
          )}
          {isAdminTier && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra hover:pl-1 transition-all"
            >
              {t("nav.admin")}
            </Link>
          )}
          {/* Login / sign-out — was missing on mobile entirely until Phase 13. */}
          {!hasSession ? (
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra hover:pl-1 transition-all"
            >
              {t("nav.login")}
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="text-left text-sm text-brown py-3 border-b border-cream-deep/50 font-medium hover:text-terra hover:pl-1 transition-all"
            >
              {t("nav.signOut")}
            </button>
          )}
          <div className="flex items-center justify-between gap-3 pt-4">
            <LanguageMenu />
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
        </div>
      )}
    </nav>
  );
}
