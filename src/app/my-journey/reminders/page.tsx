import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function RemindersPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">← My Mandi</Link>
          <h1 className="font-display text-3xl text-brown mt-3">My reminders</h1>
          <p className="text-brown/70 text-sm">Switch each one on or off. You can change this any time.</p>
          <div className="space-y-3 mt-5">
            <Toggle label="Appointment reminders" on />
            <Toggle label="Treatment reminder" on note="Every 4 days at 08:00. Set from your doctor's plan." />
            <Toggle label="Diary nudge" />
          </div>
          <p className="text-brown/60 text-xs mt-4">
            Your check-ins at six weeks and four months still come by email; you agreed to these when you joined (C5).
          </p>
        </div>
      </main>
    </>
  );
}

function Toggle({ label, on, note }: { label: string; on?: boolean; note?: string }) {
  return (
    <div className="bg-cream-soft rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <p className="text-brown font-medium">{label}</p>
        <span className={on ? "rounded-full bg-terra text-white px-3 py-1 text-xs" : "rounded-full border border-brown/20 text-brown/60 px-3 py-1 text-xs"}>
          {on ? "On" : "Off"}
        </span>
      </div>
      {note && <p className="text-brown/60 text-xs mt-1">{note}</p>}
    </div>
  );
}
