import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function HermiPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-3xl text-brown">Meet Hermi, your person at Mandi</h1>
          <div className="bg-cream-soft rounded-3xl p-6 mt-5 text-sm text-brown space-y-2">
            <p className="font-semibold">Hermi King · Co-founder, Mandi</p>
            <p>A real person who knows you. Message Hermi on WhatsApp about booking, your medical aid or what happens next.</p>
            <p className="text-brown/70">Hermi is not a doctor. Questions about your health, symptoms or treatment go to Dr Naledi, who knows your story.</p>
            <p className="text-brown/70">Weekdays 08:00 to 18:00. Hermi replies within one working day.</p>
          </div>
          <Link href="/my-journey" className="block text-center mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Say hello on WhatsApp
          </Link>
          <span className="block text-center text-brown/60 text-sm mt-3">Maybe later. I&rsquo;ll find Hermi under Help.</span>
        </div>
      </main>
    </>
  );
}
