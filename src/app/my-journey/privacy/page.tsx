import Link from "next/link";
import NavBar from "@/components/NavBar";

const consents = [
  "Use of my answers",
  "Research and hearing from Mandi",
  "Save in my account",
  "Share with my doctor",
  "Voice recording",
  "Check-in contact",
];

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">← My Mandi</Link>
          <h1 className="font-display text-3xl text-brown mt-3">My privacy</h1>
          <p className="text-brown/70 text-sm">You decide. Change any choice, or ask for your data.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-5 space-y-3">
            {consents.map((c) => (
              <div key={c} className="flex items-center justify-between gap-4">
                <p className="text-sm text-brown">{c}</p>
                <span className="text-terra text-sm">Withdraw</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 mt-5 text-sm">
            <span className="block text-terra">Ask for my data</span>
            <span className="block text-terra">Delete my account</span>
            <Link href="/privacy" className="block text-brown/60">Read the full privacy notice</Link>
          </div>
        </div>
      </main>
    </>
  );
}
