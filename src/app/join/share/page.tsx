import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function SharePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Share your summary with your doctor</h1>
          <p className="text-brown/70 text-sm mt-1">So your doctor knows your story before you talk.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-5 text-sm text-brown space-y-2">
            <p><strong>What they see.</strong> Your MenoScore, your three hardest areas, all your answers, your last 30 days of diary and what you tell us before the appointment.</p>
            <p><strong>Who.</strong> Only the doctor we match you with. They keep a copy in their practice records.</p>
            <p><strong>If you change doctor.</strong> We&rsquo;ll ask you again before anything is shared.</p>
            <p><strong>Your choice.</strong> Withdraw any time in My privacy.</p>
          </div>
          <label className="flex items-start gap-3 mt-4 text-sm text-brown">
            <input type="checkbox" className="mt-1" />
            I agree that Mandi shares my summary with my Mandi doctor.
          </label>
          <Link href="/join/next-months" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Find my doctor
          </Link>
        </div>
      </main>
    </>
  );
}
