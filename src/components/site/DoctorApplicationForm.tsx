"use client";

import { useState } from "react";
import Link from "next/link";
import { applyDoctor } from "@/server/actions/doctor-application";
import { DOCTOR_LANGUAGES } from "@/lib/domain/doctor-languages";

const FIELD =
  "rounded-[10px] border border-[#E4C7A8] bg-white px-3.5 py-3 text-[15px] text-brown outline-none transition-colors focus:border-coral";

export default function DoctorApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus("sending");
    setError("");

    const result = await applyDoctor({
      name: String(data.get("name") ?? ""),
      hpcsa: String(data.get("hpcsa") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      training: String(data.get("training") ?? ""),
      languages: data.getAll("languages").map(String),
      consent: data.get("consent_popia") === "on",
      contactConsent: data.get("consent_contact") === "on",
    });

    if (result.ok) {
      setStatus("ok");
      return;
    }
    setStatus("error");
    setError(result.error);
  }

  if (status === "ok") {
    return (
      <div
        role="status"
        className="flex flex-[999_1_560px] flex-col gap-3 rounded-[20px] bg-cream p-8 shadow-[0_30px_60px_rgba(140,60,30,0.18)] sm:p-11"
      >
        <span className="text-[11px] font-bold tracking-[0.22em] text-terra">
          APPLICATION RECEIVED
        </span>
        <h3 className="font-display text-2xl font-extrabold text-brown">
          Thank you — we&apos;ll be in touch within 24 hours.
        </h3>
        <p className="text-[15px] leading-relaxed text-brown-soft">
          We&apos;ll review your HPCSA number, training and languages, and reply
          by email or on your mobile.
        </p>
        <Link href="/" className="mt-2 text-sm font-bold text-terra underline">
          Back to Mandi
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="flex flex-[999_1_560px] flex-col gap-5 rounded-[20px] bg-cream p-6 shadow-[0_30px_60px_rgba(140,60,30,0.18)] sm:p-11"
    >
      <div className="grid gap-x-5 gap-y-[18px] sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          Full name
          <input name="name" type="text" required className={FIELD} />
        </label>

        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          <span>HPCSA number</span>
          <input
            name="hpcsa"
            type="text"
            required
            pattern="[Mm][Pp] ?[0-9]{7}"
            placeholder="MP 0123456"
            title="Your HPCSA number: MP followed by 7 digits, for example MP 0123456"
            autoComplete="off"
            className={FIELD}
          />
          <span className="text-xs font-normal text-brown-muted">
            MP followed by 7 digits, as on your practitioner card
          </span>
        </label>

        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          Email
          <input name="email" type="email" required className={FIELD} />
        </label>

        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          Mobile
          <input name="phone" type="tel" required className={FIELD} />
        </label>

        <label className="flex flex-col gap-2 text-[13px] font-semibold sm:col-span-2">
          Menopause training so far
          <input name="training" type="text" className={FIELD} />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="mb-3 text-[13px] font-semibold">
            Languages you consult in{" "}
            <span className="font-normal text-brown-muted">
              (choose all that apply)
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {DOCTOR_LANGUAGES.map((language) => (
              <label
                key={language}
                className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-[#E4C7A8] bg-white px-3.5 py-2 text-[13px] font-medium has-[:checked]:border-coral has-[:checked]:bg-blush"
              >
                <input
                  type="checkbox"
                  name="languages"
                  value={language}
                  className="h-4 w-4 accent-[#F47B4C]"
                />
                {language}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EBD3BC] pt-[18px]">
        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed">
          <input
            type="checkbox"
            name="consent_popia"
            required
            className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 accent-[#F47B4C]"
          />
          <span>
            I agree that JoinMandi (Pty) Ltd may store and use the information in
            this form to assess my application to the Mandi doctor panel, in line
            with the Protection of Personal Information Act (POPIA). I can ask
            for it to be corrected or deleted at any time.{" "}
            <Link href="/consent" className="underline">
              Read our privacy notice
            </Link>
            .
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed">
          <input
            type="checkbox"
            name="consent_contact"
            className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 accent-[#F47B4C]"
          />
          <span>
            Mandi may contact me about my application by email and on my mobile
            number.
          </span>
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-[#A63A1F]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 self-start rounded-full bg-brown px-7 py-4 text-base font-bold text-[#FFF5E6] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Apply to join →"}
      </button>
    </form>
  );
}
