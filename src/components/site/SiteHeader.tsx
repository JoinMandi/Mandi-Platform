"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", tag: "EN" },
  { code: "zu", tag: "ZU" },
  { code: "xh", tag: "XH" },
  { code: "af", tag: "AF" },
] as const;

const LINKS = [
  { id: "women", href: "/#women", label: "For women" },
  { id: "doctors", href: "/doctors", label: "For doctors" },
  { id: "about", href: "/about", label: "About" },
] as const;

interface SiteHeaderProps {
  /** `page` is the plain nav used on Doctors / About. */
  variant?: "home" | "page";
  active?: "women" | "doctors" | "about";
  cta?: { href: string; label: string };
}

/**
 * Header for the public site (Home, Doctors, About). The language pills set
 * the app language; the marketing copy itself falls back to English until
 * `home.*` is translated.
 */
export default function SiteHeader({
  variant = "home",
  active,
  cta,
}: SiteHeaderProps) {
  const { i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const current = (i18n.language || "en").slice(0, 2);

  const pick = (code: string) => {
    void i18n.changeLanguage(code);
    try {
      localStorage.setItem("mandi-lang", code);
    } catch {
      /* private browsing */
    }
    setOpen(false);
  };

  const links = LINKS.map((link) => (
    <Link
      key={link.id}
      href={link.href}
      aria-current={active === link.id ? "page" : undefined}
      className={
        variant === "home"
          ? "rounded-full px-4 py-2.5 text-brown no-underline hover:bg-cream/70"
          : `text-brown no-underline hover:text-terra ${
              active === link.id
                ? "underline decoration-2 underline-offset-8"
                : ""
            }`
      }
    >
      {link.label}
    </Link>
  ));

  const languages = (
    <span className="flex gap-0.5 pl-1.5" aria-label="Language">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          onClick={() => pick(language.code)}
          aria-pressed={current === language.code}
          className={`rounded-full px-2.5 py-2 text-[13px] ${
            current === language.code
              ? "bg-brown-warm text-[#FFF5E6]"
              : "text-brown hover:bg-cream/70"
          }`}
        >
          {language.tag}
        </button>
      ))}
    </span>
  );

  return (
    <header className="relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-10">
      <Link href="/" aria-label="Mandi home">
        <Image
          src="/brand/mandi-v4-logo.png"
          alt="Mandi"
          width={92}
          height={41}
          priority
          className="h-auto w-[72px] sm:w-[88px]"
        />
      </Link>

      {variant === "home" ? (
        <nav
          aria-label="Main"
          className="hidden items-center gap-1.5 rounded-full bg-cream/55 p-1.5 text-[15px] font-semibold md:flex"
        >
          {links}
          {languages}
        </nav>
      ) : (
        <nav
          aria-label="Main"
          className="hidden items-center gap-[30px] text-[15px] font-semibold md:flex"
        >
          {links}
          {cta && (
            <Link
              href={cta.href}
              className="rounded-full bg-brown px-5 py-[11px] text-[#FFF5E6] no-underline transition-transform hover:-translate-y-0.5"
            >
              {cta.label}
            </Link>
          )}
        </nav>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="site-menu"
        className="rounded-full bg-cream/55 px-4 py-2.5 text-sm font-bold md:hidden"
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <div
          id="site-menu"
          className="flex w-full flex-col gap-1 rounded-3xl bg-cream/95 p-3 text-[15px] font-semibold shadow-warm md:hidden"
        >
          {links}
          {cta && (
            <Link
              href={cta.href}
              className="mt-1 rounded-full bg-brown px-5 py-3 text-center text-[#FFF5E6] no-underline"
            >
              {cta.label}
            </Link>
          )}
          {variant === "home" && (
            <div className="mt-1 border-t border-cream-deep pt-2">{languages}</div>
          )}
        </div>
      )}
    </header>
  );
}
