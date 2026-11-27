import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function SchemePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold">Discovery Health · [plan]</p>
          <h1 className="font-display text-2xl text-brown mt-1">What your medical aid covers</h1>
          <div className="bg-cream-soft rounded-3xl p-5 mt-4 text-sm text-brown space-y-3">
            <p><strong>Menopause medicines.</strong> Discovery publishes a menopause medicine list. Medicines on it are paid from your benefit.</p>
            <p><strong>Ask your doctor for this.</strong> For some cover, your doctor completes a form. Ask Dr Naledi at your appointment.</p>
            <p><strong>How to claim.</strong> Your doctor sends the form to Discovery, Discovery lets you know if it&rsquo;s approved, and you fill your script at a pharmacy that claims from Discovery directly.</p>
          </div>
          <p className="text-brown/60 text-xs mt-4">
            Information and navigation only. Mandi doesn&rsquo;t pay or reimburse anything, and can&rsquo;t advise which scheme or plan to choose; for that, speak to an accredited broker.
          </p>
          <Link href="/help/hermi" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Ask Hermi about this
          </Link>
        </div>
      </main>
    </>
  );
}
