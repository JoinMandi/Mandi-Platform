"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { logSymptom } from "@/server/actions/journey";

const ROWS = [
  { domain: "mood", label: "Mood" },
  { domain: "energy", label: "Energy" },
  { domain: "sleep", label: "Sleep" },
  { domain: "anxiety", label: "Anxiety" },
  { domain: "hot-flushes", label: "Hot flushes" },
  { domain: "brain-fog", label: "Memory and focus" },
  { domain: "joint-pain", label: "Joint pain" },
  { domain: "vaginal-discomfort", label: "Vaginal discomfort" },
];

const LABELS = ["Not at all", "A little", "Quite a bit", "Extremely"];

export default function DiaryPage() {
  const [scores, setScores] = useState<Record<string, number>>(
    Object.fromEntries(ROWS.map((r) => [r.domain, 1])),
  );
  const [saved, setSaved] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const save = async () => {
    setSaved(false);
    for (const r of ROWS) {
      await logSymptom(today, r.domain, scores[r.domain]);
    }
    setSaved(true);
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">
            ← My Mandi
          </Link>
          <h1 className="font-display text-3xl text-brown mt-3">How was today?</h1>
          <p className="text-brown/70 text-sm mt-1 mb-6">
            Mood, energy and sleep every day, then your six from your last blanket.
          </p>

          <div className="space-y-3">
            {ROWS.map((r) => (
              <div key={r.domain} className="bg-cream-soft rounded-3xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-brown font-medium">{r.label}</p>
                  <span className="text-brown/60 text-xs">{LABELS[scores[r.domain]]}</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {[0, 1, 2, 3].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setScores((s) => ({ ...s, [r.domain]: v }))}
                      className={
                        scores[r.domain] === v
                          ? "flex-1 rounded-full bg-terra text-white py-2 text-xs"
                          : "flex-1 rounded-full border border-brown/20 text-brown/70 py-2 text-xs"
                      }
                    >
                      {LABELS[v]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={save}
              className="rounded-full bg-terra text-white px-6 py-3 text-sm font-semibold"
            >
              Save today
            </button>
            {saved && <span className="text-sm text-brown/60">Saved.</span>}
          </div>
        </div>
      </main>
    </>
  );
}
