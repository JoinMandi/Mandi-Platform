"use client";

import { useState, type ReactNode } from "react";
import { saveOutcome } from "@/server/actions/consultations";

const changedOptions = ["Treatment started", "Dose changed", "Tests requested", "Referred", "Nothing"];

export default function OutcomePage() {
  const [state, setState] = useState<"form" | "saved" | "error">("form");
  const [message, setMessage] = useState("");
  const [attended, setAttended] = useState("Yes");
  const [changed, setChanged] = useState<string[]>([]);
  const [medicine, setMedicine] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [referral, setReferral] = useState("");
  const [fee, setFee] = useState("");
  const [usefulness, setUsefulness] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  if (state === "saved") {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="bg-cream-soft rounded-3xl p-8 max-w-md text-center">
          <h1 className="font-display text-2xl text-brown mb-2">Outcome saved</h1>
          <p className="text-brown/70 text-sm">
            Thank you. The six-week follow-up is recorded, and her check-in is scheduled three days before it.
          </p>
        </div>
      </main>
    );
  }

  const submit = async () => {
    setBusy(true);
    setMessage("");
    const res = await saveOutcome({
      attended,
      read_summary: null,
      changed: changed.length ? changed : null,
      treatment: medicine || frequency || startDate ? { medicine, frequency, startDate } : null,
      referral: referral || null,
      follow_up_at: followUp || null,
      fee_cents: fee ? Math.round(Number(fee) * 100) : null,
      usefulness,
    });
    setBusy(false);
    if (res.ok) setState("saved");
    else {
      setState("form");
      setMessage(res.error);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-terra text-xs uppercase tracking-[0.2em] font-semibold">Outcome · consultation</p>
        <h1 className="font-display text-3xl text-brown mt-2">After the consultation</h1>
        <p className="text-brown/70 text-sm mt-1 mb-6">
          About three minutes. Choices, not notes. Keep your clinical notes in your own records.
        </p>

        <div className="space-y-5">
          <Field label="Did she attend?">
            <div className="flex gap-3">
              {["Yes", "No-show", "Rescheduled"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAttended(v)}
                  className={
                    attended === v
                      ? "rounded-full bg-terra text-white px-4 py-2 text-sm"
                      : "rounded-full border border-brown/20 text-brown px-4 py-2 text-sm"
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field label="What changed?">
            <div className="flex flex-wrap gap-2">
              {changedOptions.map((v) => {
                const on = changed.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() =>
                      setChanged((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
                    }
                    className={
                      on
                        ? "rounded-full bg-golden/40 text-brown px-4 py-2 text-sm"
                        : "rounded-full border border-brown/20 text-brown px-4 py-2 text-sm"
                    }
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Treatment plan">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" placeholder="Medicine or treatment" value={medicine} onChange={(e) => setMedicine(e.target.value)} />
              <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" placeholder="How often" value={frequency} onChange={(e) => setFrequency(e.target.value)} />
              <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" placeholder="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </Field>

          <Field label="Six-week follow-up (required)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input type="date" className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
              <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" placeholder="Your fee for this consultation (R)" value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
          </Field>

          <Field label="Referred to">
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown" placeholder="Gynaecologist, psychiatrist or other (or leave blank)" value={referral} onChange={(e) => setReferral(e.target.value)} />
          </Field>

          <Field label="How useful was the summary?">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setUsefulness(v)}
                  className={
                    usefulness === v
                      ? "flex-1 rounded-full bg-terra text-white py-2 text-xs"
                      : "flex-1 rounded-full border border-brown/20 text-brown/70 py-2 text-xs"
                  }
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          {message && <p className="text-red-700 text-sm">{message}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="rounded-full bg-terra text-white px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            Send outcome
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-brown font-medium mb-2">{label}</p>
      {children}
    </div>
  );
}
