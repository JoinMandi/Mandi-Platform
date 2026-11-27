import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function RecordingPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Your consultations are voice-recorded</h1>
          <div className="bg-golden/20 rounded-3xl p-5 mt-4 text-sm text-brown space-y-2">
            <p><strong>Voice only. We never record video.</strong></p>
            <p>Mandi is in its pilot, and recording lets us check quality and learn what helps, for every woman who comes after you.</p>
            <p>We keep only notes from it, without your name. Only a small research team sees the transcript.</p>
            <p>Because we are in a pilot, every appointment is recorded. We told you this before you joined.</p>
          </div>
          <label className="flex items-start gap-3 mt-4 text-sm text-brown">
            <input type="checkbox" className="mt-1" />
            I agree that my consultations are voice-recorded for quality and research.
          </label>
          <Link href="/my-doctor/book" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Continue to booking
          </Link>
        </div>
      </main>
    </>
  );
}
