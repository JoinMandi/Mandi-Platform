"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { fetchLatestConsultation } from "@/server/actions/consultations";
import type { ConsultationRow } from "@/lib/types/database";

function fmt(iso: string | null): string {
  if (!iso) return "Thursday 7 January, 18:00";
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AppointmentPage() {
  const [c, setC] = useState<ConsultationRow | null>(null);

  useEffect(() => {
    fetchLatestConsultation().then(setC).catch(() => setC(null));
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Your appointment</h1>
          <div className="bg-cream-soft rounded-3xl p-5 mt-4 text-sm text-brown space-y-2">
            <p className="font-semibold">{fmt(c?.appointment_at ?? null)}</p>
            <p className="text-brown/70">
              30 minutes · online · with {c?.doctor_name ?? "Dr Naledi"}
            </p>
            <p>Status: {c?.status ?? "booked"}</p>
            <p>Voice recording: {c ? (c.recording_consent ? "Yes, part of the pilot" : "Not recorded") : "Yes, part of the pilot"}</p>
          </div>
          <div className="space-y-3 mt-5">
            <Link href="/my-appointment/join" className="block rounded-full border border-brown/20 text-brown px-6 py-3 text-sm text-center">
              How to join
            </Link>
            <Link href="/my-appointment/lobby" className="block rounded-full bg-terra text-white px-6 py-3 text-sm text-center">
              Join (opens 10 minutes before)
            </Link>
            <Link href="/check-in/cancelled" className="block text-center text-brown/60 text-sm">
              Move or cancel
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
