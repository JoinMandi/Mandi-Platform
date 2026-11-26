"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function V4Landing() {
  const { t } = useTranslation("common");
  const free = [1, 2, 3, 4].map((n) => t(`v4.landing.free${n}`));

  return (
    <div className="min-h-screen bg-cream">
      <header className="relative overflow-hidden bg-mandi-hero">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-white/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-5 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between gap-3">
            <Image src="/brand/mandi-v4-logo.png" alt="Mandi" width={72} height={32} className="h-8 w-auto" priority />
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-cream-soft px-3 py-1.5 text-xs font-bold text-brown sm:inline">
                {t("v4.landing.seen")}
              </span>
              <Link
                href="/v4/language"
                className="rounded-full bg-brown-warm px-3 py-1.5 text-xs font-bold text-cream-soft transition-opacity hover:opacity-90"
              >
                EN ▾
              </Link>
            </div>
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] text-brown sm:text-6xl lg:text-7xl">
            {t("v4.landing.talk")}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-semibold text-brown sm:text-xl">
            {t("v4.landing.sub")}
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:px-16 lg:py-14">
        <div className="flex flex-col gap-6">
          <p className="max-w-xl text-lg leading-relaxed text-brown-deep">
            {t("v4.landing.body")}
          </p>
          <div className="hidden lg:block">
            <Link
              href="/v4/consent"
              className="inline-block rounded-full bg-mandi-button px-10 py-4 text-base font-bold text-brown shadow-[0_8px_18px_rgba(244,123,76,0.35)] transition-transform hover:scale-[1.02]"
            >
              {t("v4.landing.start")}
            </Link>
            <p className="mt-3 text-sm text-brown-soft">
              {t("v4.landing.member")}{" "}
              <Link href="/auth/login" className="font-semibold underline">
                {t("v4.landing.signIn")}
              </Link>
            </p>
          </div>
        </div>

        <aside className="rounded-3xl bg-mandi-card p-5 sm:p-6">
          <p className="font-display text-lg font-bold text-brown">
            {t("v4.landing.freeTitle")}
          </p>
          <ul className="mt-3 space-y-3">
            {free.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-brown-soft">
                <span aria-hidden className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-mandi-button" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col gap-3 lg:hidden">
          <Link
            href="/v4/consent"
            className="block rounded-full bg-mandi-button px-10 py-4 text-center text-base font-bold text-brown shadow-[0_8px_18px_rgba(244,123,76,0.35)]"
          >
            {t("v4.landing.start")}
          </Link>
          <p className="text-center text-sm text-brown-soft">
            {t("v4.landing.member")}{" "}
            <Link href="/auth/login" className="font-semibold underline">
              {t("v4.landing.signIn")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
