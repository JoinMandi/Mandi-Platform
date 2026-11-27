import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function JoinLanguagePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-xl mx-auto px-6 py-12">
          <h1 className="font-display text-3xl text-brown">Which language shall we continue in?</h1>
          <p className="text-brown/70 text-sm mt-1">
            From here on, Mandi is in English or Afrikaans for now.
          </p>
          <div className="space-y-3 mt-6">
            <Link href="/join/pay" className="block bg-cream-soft rounded-3xl p-5 text-brown font-medium">
              English · Talk to Mandi
            </Link>
            <Link href="/join/pay" className="block bg-cream-soft rounded-3xl p-5 text-brown font-medium">
              Afrikaans · Praat met Mandi
            </Link>
            <div className="bg-cream-soft/60 rounded-3xl p-5 text-brown/50 text-sm">
              isiZulu · Coming soon
            </div>
            <div className="bg-cream-soft/60 rounded-3xl p-5 text-brown/50 text-sm">
              isiXhosa · Coming soon
            </div>
          </div>
          <p className="text-brown/60 text-xs mt-4">
            Your results stay in your language. A few steps are in English only for now: the payment page, the booking calendar and its texts, and Teams.
          </p>
        </div>
      </main>
    </>
  );
}
