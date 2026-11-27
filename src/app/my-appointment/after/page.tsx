import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function AfterPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Your follow-up is booked</h1>
          <p className="text-brown/70 text-sm">Dr Naledi set this with you in your first appointment.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-4 text-sm text-brown space-y-2">
            <p className="font-semibold">Six-week follow-up</p>
            <p className="text-brown/70">Thursday 18 February · 18:00 · online · a shorter appointment at a lower fee</p>
            <p className="text-brown/70">On Monday 15 February we&rsquo;ll ask you to make your blanket again, so you and Dr Naledi can see what changed.</p>
          </div>
          <div className="space-y-3 mt-5">
            <Link href="/my-journey/reminders" className="block text-center rounded-full bg-terra text-white px-6 py-3 text-sm">
              Choose my reminders
            </Link>
            <Link href="/my-journey" className="block text-center rounded-full border border-brown/20 text-brown px-6 py-3 text-sm">
              Back to my home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
