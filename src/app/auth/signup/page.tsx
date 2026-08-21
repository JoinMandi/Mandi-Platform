"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createBrowserClient } from "@/server/supabase/browser";
import { seedUserProfile } from "@/server/actions/account";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import PetalBurst from "@/components/ui/PetalBurst";

const INPUT_CLASS =
  "bg-cream border-2 border-coral/30 rounded-xl px-4 py-3 text-brown transition-all " +
  "focus:border-terra focus:ring-2 focus:ring-golden/40 focus:shadow-warm";

function passwordStrength(pw: string): { score: number; labelKey: string; color: string } {
  if (pw.length === 0) return { score: 0, labelKey: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) s += 1;
  if (s <= 1) return { score: 1, labelKey: "auth.strength.weak", color: "bg-flame" };
  if (s === 2) return { score: 2, labelKey: "auth.strength.fair", color: "bg-sun" };
  return { score: 3, labelKey: "auth.strength.strong", color: "bg-golden" };
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmEmailNotice, setConfirmEmailNotice] = useState(false);

  const strength = passwordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);
    if (password !== confirm) {
      setErrorKey("auth.error.passwordMismatch");
      return;
    }
    if (password.length < 8) {
      setErrorKey("auth.error.passwordTooShort");
      return;
    }
    setPending(true);
    const supabase = createBrowserClient();
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setPending(false);

    if (err) {
      setErrorKey(authErrorKey(err.message));
      return;
    }

    // Seed row in public.users (best-effort — no-ops without a session yet)
    if (data.user) {
      const lang =
        typeof window !== "undefined" ? localStorage.getItem("mandi-lang") ?? "en" : "en";
      await seedUserProfile(lang);
    }

    // Supabase may require email confirmation depending on project settings
    if (data.session) {
      router.push("/my-journey");
      router.refresh();
    } else {
      setConfirmEmailNotice(true);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <NavBar />
      <div className="absolute inset-0 -z-10 bg-mandi-gradient-soft" />
      <div className="absolute inset-0 -z-10 bg-cream/40" />

      <div className="relative z-10 flex items-center justify-center px-5 py-16 min-h-[calc(100vh-64px)]">
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

          {!confirmEmailNotice ? (
            <>
              <Reveal delay={90}>
                <h1 className="font-display text-3xl sm:text-4xl text-brown text-center mb-2">
                  {t("auth.signup.title")}
                </h1>
                <p className="text-center text-brown/65 text-sm mb-8">
                  {t("auth.signup.subtitle")}
                </p>
              </Reveal>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Reveal delay={160}>
                  <Field label={t("auth.field.email")} type="email" value={email} onChange={setEmail} autoComplete="email" />
                </Reveal>
                <Reveal delay={220}>
                  <div className="flex flex-col gap-2">
                    <Field label={t("auth.field.password")} type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                    {password.length > 0 && (
                      <div className="flex items-center gap-2.5">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3].map((n) => (
                            <div
                              key={n}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300
                                ${n <= strength.score ? strength.color : "bg-brown/10"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-brown/55 w-24 text-right">
                          {strength.labelKey ? t(strength.labelKey) : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </Reveal>
                <Reveal delay={280}>
                  <Field label={t("auth.field.confirmPassword")} type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
                </Reveal>

                {errorKey && (
                  <div className="bg-terra/10 border border-terra/30 text-terra rounded-xl px-4 py-2.5 text-sm">
                    {t(errorKey)}
                  </div>
                )}

                <Reveal delay={340}>
                  <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full mt-2">
                    {pending ? t("auth.signup.submitPending") : `${t("auth.signup.submit")} →`}
                  </Button>
                </Reveal>
              </form>

              <Reveal delay={410}>
                <div className="mt-6 text-center text-sm text-brown/65">
                  {t("auth.signup.havePrompt")}{" "}
                  <Link href="/auth/login" className="link-warm text-terra">
                    {t("auth.signup.haveCta")}
                  </Link>
                </div>
              </Reveal>
            </>
          ) : (
            <Reveal variant="fade">
              <div className="relative text-center py-6">
                <PetalBurst />
                <p className="relative font-display text-2xl text-brown mb-3">
                  {t("auth.signup.confirmTitle")}
                </p>
                <p className="relative text-brown/70 text-sm mb-6">
                  {t("auth.signup.confirmBody", { email })}
                </p>
                <Link href="/auth/login" className="link-warm text-terra text-sm">
                  {t("auth.signup.confirmBack")} →
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
        {label}
      </span>
      <input
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function authErrorKey(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("user already registered")) return "auth.error.alreadyRegistered";
  if (m.includes("invalid email")) return "auth.error.invalidEmail";
  if (m.includes("password")) return "auth.error.weakPassword";
  return "auth.error.generic";
}
