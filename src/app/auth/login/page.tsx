"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createBrowserClient } from "@/server/supabase/browser";
import Button from "@/components/ui/Button";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/my-journey";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setPending(false);
    if (err) {
      setError(humanAuthError(err.message));
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
          <h1 className="font-display text-3xl text-brown text-center mb-2">
            Welcome back.
          </h1>
          <p className="text-center text-brown/65 text-sm mb-8">
            Sign in to see your roadmap, symptom log, and check-ins.
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-cream border-2 border-coral/30 focus:border-terra rounded-xl px-4 py-3 text-brown"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brown/60">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-cream border-2 border-coral/30 focus:border-terra rounded-xl px-4 py-3 text-brown"
              />
            </label>

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
              {pending ? "Signing you in…" : "Welcome back →"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-brown/65">
            New to Mandi?{" "}
            <Link href="/auth/signup" className="link-warm text-terra">
              Join Mandi
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function humanAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password didn't match. Try again.";
  if (m.includes("email not confirmed")) return "Please confirm your email — check your inbox.";
  if (m.includes("rate limit")) return "Too many attempts. Wait a minute and try again.";
  return message;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
