import Link from "next/link";
import NavBar from "@/components/NavBar";

const schemes = ["Discovery Health Medical Scheme", "Bonitas", "Momentum Health", "GEMS", "Another medical aid", "I don't have medical aid"];

export default function MedicalAidPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Help with my medical aid</h1>
          <p className="text-brown/70 text-sm">What your medical aid covers for menopause care, and how to claim.</p>
          <div className="space-y-2 mt-5">
            {schemes.map((s) => (
              <Link key={s} href="/help/medical-aid/scheme" className="block bg-cream-soft rounded-2xl p-4 text-sm text-brown">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
