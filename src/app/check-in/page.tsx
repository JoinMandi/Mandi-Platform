import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function CheckInStartPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-3xl text-brown">Six weeks in. Let&rsquo;s see what has changed.</h1>
          <p className="text-brown/70 text-sm mt-2">
            Before your follow-up with Dr Naledi on Thursday, answer the same 56 questions as in December. With each question we show what you said last time, so you can see the difference. About ten minutes, with a cup of tea.
          </p>
          <p className="text-brown/70 text-sm mt-2">Your doctor will see your new blanket before you talk.</p>
          <div className="space-y-3 mt-6">
            <Link href="/questionnaire?checkin=4month" className="block text-center rounded-full bg-terra text-white px-6 py-3 text-sm">
              Make my new blanket
            </Link>
            <span className="block text-center text-brown/60 text-sm">Remind me tomorrow</span>
          </div>
        </div>
      </main>
    </>
  );
}
