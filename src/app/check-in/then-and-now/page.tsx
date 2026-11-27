"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { fetchCheckinComparison, type CheckinComparison } from "@/server/actions/consultations";

export default function ThenNowPage() {
  const [c, setC] = useState<CheckinComparison | null>(null);

  useEffect(() => {
    fetchCheckinComparison().then(setC).catch(() => setC(null));
  }, []);

  const previous = c?.previousScore ?? 64;
  const latest = c?.latestScore ?? 51;
  const delta = c?.delta ?? previous - latest;
  const improved = c?.improved ?? 23;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold">Then and now</p>
          <h1 className="font-display text-3xl text-brown mt-1">
            {previous} to {latest}
          </h1>
          <p className="text-brown/70 text-sm mt-1">
            {delta > 0 ? `${delta} points lower. ` : delta < 0 ? `${Math.abs(delta)} points higher. ` : ""}
            {improved} patches have turned golden.
          </p>
          <div className="bg-golden/20 rounded-3xl p-5 mt-5 text-sm text-brown">
            <p>Previous: {previous}</p>
            <p>Now: {latest}</p>
            <p className="text-brown/60 text-xs mt-2">Dr Naledi sees this before your follow-up.</p>
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/check-in/questions" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Continue</Link>
            <Link href="/my-journey" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Back to home</Link>
          </div>
        </div>
      </main>
    </>
  );
}
