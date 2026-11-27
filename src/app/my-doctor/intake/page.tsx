import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function IntakePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Help Dr Naledi get ready for you</h1>
          <p className="text-brown/70 text-sm">Optional. Five minutes now means your 30 minutes are about you, not forms. You can also do it later from your home screen.</p>
          <div className="space-y-3 mt-5">
            <textarea className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" rows={2} placeholder="What do you think is going on? (optional)" />
            <textarea className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" rows={2} placeholder="How would you like us to treat it, together? (optional)" />
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Medicines, supplements and herbal remedies" />
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Allergies, and what happened" />
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Last period, and any heavy or unusual bleeding" />
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Your medical aid" />
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/my-appointment" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Send to Dr Naledi</Link>
            <Link href="/my-appointment" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Skip for now</Link>
          </div>
          <p className="text-brown/60 text-xs mt-3">Only your doctor sees this, under the sharing you agreed to (C3).</p>
        </div>
      </main>
    </>
  );
}
