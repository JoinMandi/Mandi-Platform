import Link from "next/link";

export default function LobbyPage() {
  return (
    <main className="min-h-screen bg-[#1c1712] text-cream flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <p className="text-golden text-xs uppercase tracking-[0.2em]">Microsoft Teams</p>
        <h1 className="font-display text-2xl mt-1">Mandi consultation with Dr Naledi</h1>
        <p className="text-cream/70 text-sm mt-4">Someone in the meeting should let you in soon.</p>
        <p className="text-cream/60 text-xs mt-2">Teams shows a notice when recording starts. Your doctor will tell you too.</p>
        <Link href="/my-appointment/after" className="mt-6 inline-block rounded-full bg-terra text-white px-6 py-3 text-sm">
          End and continue
        </Link>
      </div>
    </main>
  );
}
