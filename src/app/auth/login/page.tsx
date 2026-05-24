"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createBrowserClient } from "@/server/supabase/browser";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";

const INPUT_CLASS =
  "bg-cream border-2 border-coral/30 rounded-xl px-4 py-3 text-brown transition-all " +
  "focus:border-terra focus:ring-2 focus:ring-golden/40 focus:shadow-warm";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/my-journey";
  const { t } = useTranslation("common");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    setPending(true);
    const supabase = createBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (err) {
      setErrorKey(authErrorKey(err.message));
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-mandi-gradient-soft" />
      <div className="absolute inset-0 bg-cream/70" />

      <div className="relative z-10 flex items-center justify-center px-5 py-16 min-h-screen">
        <div className="w-full max-w-md bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10">
          <Reveal>
            <Link href="/" className="flex justify-center mb-6">
              <Image
                src="/Mandi_Logo.svg"
                alt="Mandi"
                width={120}
                height={35}
                className="[filter:invert(23%)_sepia(46%)_saturate(1800%)_hue-rotate(340deg)_brightness(88%)]"
              />
            </Link>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="font-display text-3xl text-brown text-center mb-2">
              {t("auth.login.title")}
            </h1>
            <p className="text-center text-brown/65 text-sm mb-8">
              {t("auth.login.subtitle")}
            </p>
          </Reveal>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Reveal delay={160}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
                  {t("auth.field.email")}
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
            </Reveal>
            <Reveal delay={230}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
                  {t("auth.field.password")}
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </label>
            </Reveal>

            {errorKey && (
              <div className="bg-terra/10 border border-terra/30 text-terra rounded-xl px-4 py-2.5 text-sm">
                {t(errorKey)}
              </div>
            )}

            <Reveal delay={300}>
              <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full mt-2">
                {pending ? t("auth.login.submitPending") : `${t("auth.login.submit")} →`}
              </Button>
            </Reveal>
          </form>

          <Reveal delay={370}>
            <div className="mt-6 text-center text-sm text-brown/65">
              {t("auth.login.newPrompt")}{" "}
              <Link href="/auth/signup" className="link-warm text-terra">
                {t("auth.login.newCta")}
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}

function authErrorKey(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "auth.error.invalidLogin";
  if (m.includes("email not confirmed")) return "auth.error.emailNotConfirmed";
  if (m.includes("rate limit")) return "auth.error.rateLimit";
  return "auth.error.generic";
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
