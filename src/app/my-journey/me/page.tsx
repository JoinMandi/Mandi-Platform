import Link from "next/link";
import NavBar from "@/components/NavBar";

const consents = [
  { label: "Use of my answers", date: "Given 14 Dec, with I am 18 or older" },
  { label: "Research and hearing from Mandi", date: "Given 14 Dec, at download" },
  { label: "Save in my account", date: "Given 16 Dec" },
  { label: "Share with my doctor", date: "Given 16 Dec · Dr Naledi" },
  { label: "Voice recording", date: "Part of every pilot appointment" },
];

export default function MePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">
            ← My Mandi
          </Link>
          <h1 className="font-display text-3xl text-brown mt-3 mb-6">Me</h1>

          <div className="bg-cream-soft rounded-3xl p-6 space-y-3 text-brown">
            <Row label="Email" value="your email" />
            <Row label="Membership" value="R149 a month" />
            <Row label="Next payment" value="16 February" />
            <Row label="My doctor" value="Dr Naledi" />
            <Row label="Help" value="WhatsApp, medical aid, partner guide" />
            <Row label="My reminders" value="Appointments on · treatment on" />
            <Row label="Language" value="English" />
          </div>

          <h2 className="font-display text-2xl text-brown mt-8 mb-3">My privacy</h2>
          <div className="bg-cream-soft rounded-3xl p-6 space-y-3">
            {consents.map((c) => (
              <div key={c.label} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-brown font-medium">{c.label}</p>
                  <p className="text-brown/60 text-sm">{c.date}</p>
                </div>
                <span className="text-terra text-sm">Withdraw</span>
              </div>
            ))}
            <div className="pt-3 border-t border-brown/10 text-sm">
              <Link href="/privacy" className="text-terra">
                Read the full privacy notice
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button className="rounded-full bg-terra text-white px-5 py-2 text-sm">
              Ask for my data
            </button>
            <button className="rounded-full border border-brown/20 text-brown px-5 py-2 text-sm">
              Change or cancel my membership
            </button>
            <Link
              href="/auth/logout"
              className="rounded-full border border-brown/20 text-brown px-5 py-2 text-sm"
            >
              Sign out
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-brown/10 pb-2 last:border-0 last:pb-0">
      <span className="text-brown/60 text-sm">{label}</span>
      <span className="text-brown text-sm text-right">{value}</span>
    </div>
  );
}
