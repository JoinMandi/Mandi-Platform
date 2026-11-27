"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { bookConsultation } from "@/server/actions/consultations";

const days = ["Thu 7", "Fri 8", "Mon 11", "Tue 12", "Wed 13"];
const times = ["17:00", "17:30", "18:00", "18:30"];

export default function BookPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const book = async (time: string) => {
    setBusy(true);
    setErr("");
    const res = await bookConsultation({
      doctorName: "Dr Naledi",
      appointmentAt: `2027-01-07T${time}:00+02:00`,
    });
    setBusy(false);
    if (res.ok) {
      router.push("/my-doctor/intake");
    } else {
      setErr(res.error);
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Mandi consultation with Dr Naledi</h1>
          <p className="text-brown/70 text-sm">30 min · Microsoft Teams link sent on booking · January 2027</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-5">
            <div className="flex flex-wrap gap-2">
              {days.map((d) => (
                <span key={d} className="rounded-full bg-white border border-brown/15 px-4 py-2 text-sm text-brown">{d}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {times.map((t) => (
                <button
                  key={t}
                  onClick={() => book(t)}
                  disabled={busy}
                  className="rounded-full bg-terra text-white px-4 py-2 text-sm disabled:opacity-50"
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-brown/60 text-xs mt-3">Time zone: South Africa Standard Time</p>
          </div>
          {err && <p className="text-red-700 text-sm mt-3">{err}</p>}
          <p className="text-brown/60 text-xs mt-4">
            Choosing a time books your first appointment and records your consent to voice recording. Next, a few optional questions for your doctor.
          </p>
        </div>
      </main>
    </>
  );
}
