import Link from "next/link";
import NavBar from "@/components/NavBar";

const benefits = [
  "A Mandi doctor, passionate about your hormone health",
  "Plain help with what your medical aid covers and how to claim",
  "A real person at Mandi you can WhatsApp",
  "Reminders for appointments and treatment, if you want them",
  "A quick 15-minute appointment to see your doctor sooner",
  "Your daily diary, which your doctor sees too",
  "Menopause 101, a short course in plain words",
  "A short guide to share with your partner or family",
  "Your data kept safe, with every check-in side by side",
];

export default function JoinPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-2">
            What you get when you join Mandi
          </p>
          <h1 className="font-display text-4xl text-brown leading-tight">
            A doctor who has read your story before you even say hello
          </h1>
          <p className="text-brown/70 text-sm mt-2">
            We match you with a GP trained in menopause who speaks your language,
            and we stay with you for the months after.
          </p>

          <h2 className="font-display text-2xl text-brown mt-8 mb-3">
            Your first four months
          </h2>
          <div className="bg-cream-soft rounded-3xl p-6 space-y-2 text-sm text-brown">
            <p>Within 48 hours: we match you with your doctor.</p>
            <p>First appointment: 30 unhurried minutes, from 5 January.</p>
            <p>Six weeks later: a follow-up appointment, and your blanket again.</p>
            <p>Four months: look back at how far you have come.</p>
          </div>

          <h2 className="font-display text-2xl text-brown mt-8 mb-3">
            What your monthly fee keeps paying for
          </h2>
          <div className="bg-cream-soft rounded-3xl p-6 space-y-2 text-sm text-brown">
            {benefits.map((b) => (
              <p key={b}>• {b}</p>
            ))}
          </div>

          <div className="bg-golden/20 rounded-3xl p-6 mt-6">
            <p className="text-brown font-semibold">Your story helps the next woman.</p>
            <p className="text-brown/75 text-sm mt-1">
              Mandi is in its pilot, so every appointment is voice-recorded, never
              video. It lets us check quality and learn what helps. Only a small
              research team sees the transcript, without your name.
            </p>
          </div>

          <div className="mt-8">
            <p className="font-display text-3xl text-brown">
              R149 <span className="text-sm text-brown/60">a month</span>
            </p>
            <p className="text-brown/65 text-sm mt-1">
              Cancel any time. Your doctor&rsquo;s own fee is separate: about R1,200 to
              R1,800 for the first 30 minutes.
            </p>
            <Link
              href="/join/language"
              className="inline-block mt-4 rounded-full bg-terra text-white px-6 py-3 text-sm font-semibold"
            >
              Join Mandi
            </Link>
            <Link href="/roadmap" className="block text-brown/60 text-sm mt-3">
              Not now
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
