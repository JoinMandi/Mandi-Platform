import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function SeeSoonerPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">See your doctor sooner</h1>
          <p className="text-brown/70 text-sm">A quick 15-minute appointment with Dr Naledi, before your follow-up.</p>
          <div className="bg-golden/20 rounded-3xl p-4 mt-4 text-sm text-brown">
            Very heavy bleeding, chest pain, or feeling very unwell? Don&rsquo;t wait: go to your nearest emergency unit or call 112.
          </div>
          <div className="space-y-2 mt-5">
            {["Bleeding", "A side effect", "A new or unusual symptom", "My treatment", "Something else"].map((r) => (
              <button key={r} className="block w-full text-left bg-cream-soft rounded-2xl p-4 text-sm text-brown">{r}</button>
            ))}
          </div>
          <div className="bg-cream-soft rounded-2xl p-4 mt-4 text-sm text-brown">
            Earliest times with Dr Naledi: Tue 12:30 · Tue 17:45 · Wed 08:00
            <p className="text-brown/60 text-xs mt-1">15 minutes, online · R[___], paid to the practice. Your medical aid may cover it.</p>
          </div>
          <Link href="/my-journey" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Book Tuesday 12:30
          </Link>
        </div>
      </main>
    </>
  );
}
