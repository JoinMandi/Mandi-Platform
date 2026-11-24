"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Button from "@/components/ui/Button";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import Reveal from "@/components/ui/Reveal";
import { submitBookingLead } from "@/server/actions/bookings";

const INPUT_CLASS =
  "bg-cream border-2 border-coral/30 rounded-xl px-4 py-3 text-brown transition-all " +
  "focus:border-terra focus:ring-2 focus:ring-golden/40 focus:shadow-warm";

export default function BookPage() {
  const { t } = useTranslation("common");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [language, setLanguage] = useState("en");
  const [concern, setConcern] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setPending(true);
    setError(null);
    const result = await submitBookingLead({
      name,
      email,
      whatsapp,
      languageCode: language,
      concern,
    });
    setPending(false);
    if (result.ok) setDone(true);
    else setError(result.error);
  };

  return (
    <>
      <NavBar />
      <main className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0 bg-mandi-gradient-soft" />
        <div className="absolute inset-0 bg-cream/45" />

        <div className="relative z-10 flex items-center justify-center px-5 py-16">
          <div className="w-full max-w-xl rounded-4xl bg-cream-soft p-8 shadow-warm-xl sm:p-10">
            {done ? (
              <Reveal variant="fade">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terra">
                  {t("book.eyebrow")}
                </p>
                <h1 className="mt-2 font-display text-3xl text-brown">
                  {t("book.successTitle")}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-brown/70">
                  {t("book.successBody")}
                </p>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block rounded-full bg-terra px-7 py-3 text-sm font-semibold text-cream hover:bg-terra-dark"
                  >
                    {t("book.whatsappCta")} →
                  </a>
                )}
                <div className="mt-6">
                  <Link href="/" className="link-warm text-sm text-terra">
                    Back to the site →
                  </Link>
                </div>
              </Reveal>
            ) : (
              <>
                <Reveal>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-terra">
                    {t("book.eyebrow")}
                  </p>
                  <h1 className="mt-2 font-display text-3xl text-brown">
                    {t("book.title")}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-brown/65">
                    {t("book.subhead")}
                  </p>
                </Reveal>

                <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown/60">
                      {t("book.name")}
                    </span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={INPUT_CLASS}
                      autoComplete="name"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown/60">
                      {t("book.email")}
                    </span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={INPUT_CLASS}
                      autoComplete="email"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown/60">
                      {t("book.whatsapp")}
                    </span>
                    <input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className={INPUT_CLASS}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown/60">
                      {t("book.language")}
                    </span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={INPUT_CLASS}
                    >
                      <option value="en">English</option>
                      <option value="zu">isiZulu</option>
                      <option value="xh">isiXhosa</option>
                      <option value="af">Afrikaans</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brown/60">
                      {t("book.concern")}
                    </span>
                    <textarea
                      value={concern}
                      onChange={(e) => setConcern(e.target.value)}
                      rows={3}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <ConsentCheckbox
                    label={t("book.consent")}
                    checked={consent}
                    onChange={setConsent}
                    required
                  />

                  {error && (
                    <div className="rounded-xl border border-terra/30 bg-terra/10 px-4 py-2.5 text-sm text-terra">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={!consent || pending}
                    className="mt-1 w-full"
                  >
                    {pending ? t("book.pending") : `${t("book.cta")} →`}
                  </Button>
                </form>

                <p className="mt-5 text-xs leading-relaxed text-brown/55">
                  {t("book.emergency")}
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
