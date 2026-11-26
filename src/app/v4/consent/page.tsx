"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { recordConsent } from "@/server/actions/consent";

function Tick() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true" className="text-brown">
      <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-brown">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 ${
          checked ? "border-0 bg-mandi-button" : "border-cream-deep bg-white"
        }`}
      >
        {checked && <Tick />}
      </span>
      <span>{children}</span>
    </label>
  );
}

export default function V4Consent() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [age, setAge] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);

  const begin = async () => {
    if (!age || !agreed) return;
    setPending(true);
    const lang =
      typeof window !== "undefined" ? localStorage.getItem("mandi-lang") : null;
    try {
      const sessionId = await recordConsent(lang);
      if (sessionId && typeof window !== "undefined") {
        localStorage.setItem("mandi-session", sessionId);
      }
    } catch {
      /* the session record is best-effort; the flow continues */
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("mandi-consent", new Date().toISOString());
    }
    router.push("/questionnaire");
  };

  return (
    <main className="min-h-screen bg-cream">
      <header className="relative overflow-hidden bg-mandi-hero px-5 py-6 sm:px-10 lg:px-16">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <Image src="/brand/mandi-v4-logo.png" alt="Mandi" width={72} height={32} className="h-8 w-auto" />
          <h1 className="mt-5 max-w-2xl font-display text-2xl font-bold leading-tight text-brown sm:text-4xl">
            {t("v4.consent.title")}
          </h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[1.2fr_1fr] lg:px-16 lg:py-12">
        <div className="flex flex-col gap-5">
          <p className="max-w-2xl text-sm leading-relaxed text-brown-deep sm:text-base">
            {t("v4.consent.body")}
          </p>
          <div className="rounded-3xl bg-mandi-card p-5 sm:p-6">
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-start gap-3 text-sm leading-relaxed text-brown-soft">
                  <span aria-hidden className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-mandi-button" />
                  <span>{t(`v4.consent.fact${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/privacy" className="text-sm font-semibold text-brown underline">
            {t("v4.consent.privacy")}
          </Link>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-warm sm:p-6">
          <Check checked={age} onChange={setAge}>
            {t("v4.consent.age")}
          </Check>
          <Check checked={agreed} onChange={setAgreed}>
            {t("v4.consent.agree")}
          </Check>
          <button
            type="button"
            className="mt-2 w-full rounded-full bg-mandi-button px-8 py-4 text-base font-bold text-brown shadow-[0_8px_18px_rgba(244,123,76,0.35)] disabled:opacity-50"
            disabled={!age || !agreed || pending}
            onClick={() => void begin()}
          >
            {t("v4.consent.continue")}
          </button>
        </div>
      </div>
    </main>
  );
}
