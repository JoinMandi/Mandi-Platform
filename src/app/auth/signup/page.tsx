"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/server/supabase/browser";
import { seedUserProfile } from "@/server/actions/account";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmEmailNotice, setConfirmEmailNotice] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Your passwords don't match yet.");
      return;
    }
    if (password.length < 8) {
      setError("Choose a password that's at least 8 characters long.");
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
      setError(humanAuthError(err.message));
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
      <div className="absolute inset-0 bg-mandi-gradient-soft" />
      <div className="absolute inset-0 bg-cream/70" />

      <div className="relative z-10 flex items-center justify-center px-5 py-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-cream-soft rounded-4xl shadow-warm-xl p-8 sm:p-10"
        >
          <Link href="/" className="flex justify-center mb-6">
            <Image
              src="/Mandi_Logo.svg"
              alt="Mandi"
              width={120}
              height={35}
              className="[filter:invert(23%)_sepia(46%)_saturate(1800%)_hue-rotate(340deg)_brightness(88%)]"
            />
          </Link>

          {!confirmEmailNotice ? (
            <>
              <h1 className="font-display text-3xl text-brown text-center mb-2">
                Join Mandi.
              </h1>
              <p className="text-center text-brown/65 text-sm mb-8">
                Save your roadmap, track your symptoms, and see how you change over time.
              </p>

              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
                <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-terra/10 border border-terra/30 text-terra rounded-xl px-4 py-2.5 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full mt-2">
                  {pending ? "Creating your account…" : "Join Mandi →"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-brown/65">
                Already have an account?{" "}
                <Link href="/auth/login" className="link-warm text-terra">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="font-display text-2xl text-brown mb-3">Check your inbox.</p>
              <p className="text-brown/70 text-sm mb-6">
                We sent a confirmation email to <span className="font-semibold">{email}</span>. Click the link
                inside to finish setting up your account.
              </p>
              <Link href="/auth/login" className="link-warm text-terra text-sm">
                Back to sign in →
              </Link>
            </div>
          )}
        </motion.div>
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
        className="bg-cream border-2 border-coral/30 focus:border-terra rounded-xl px-4 py-3 text-brown"
      />
    </label>
  );
}

function humanAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("user already registered")) return "That email already has an account. Try signing in instead.";
  if (m.includes("invalid email")) return "That email doesn't look quite right.";
  if (m.includes("password")) return "Your password didn't meet the requirements. Try something at least 8 characters long.";
  return message;
}
