import Link from "next/link";
import NavBar from "@/components/NavBar";

const steps = [
  ["Within 48 hours", "We match you with a Mandi doctor who speaks your language."],
  ["An email from Mandi", "with your doctor&rsquo;s name, photo and a calendar to pick a time."],
  ["Questions", "about your medical history, medicines and supplements, family history and medical aid, so your doctor is ready."],
  ["Your first appointment", "30 minutes, online. Appointments start 5 January."],
  ["Six weeks later", "A shorter follow-up at a lower fee, and your blanket again."],
  ["Four months", "See how far you&rsquo;ve come."],
];

export default function NextMonthsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Your next four months</h1>
          <div className="space-y-2 mt-5">
            {steps.map(([title, body], i) => (
              <div key={i} className="bg-cream-soft rounded-2xl p-4 text-sm text-brown">
                <p className="font-semibold">{i + 1}. {title}</p>
                <p className="text-brown/70" dangerouslySetInnerHTML={{ __html: body }} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/my-journey" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">
              Go to my home
            </Link>
            <Link href="/my-doctor" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">
              Meet my doctor
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
