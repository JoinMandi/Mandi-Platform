import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function FollowUpPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-brown/60 text-sm">3 of 3</p>
          <h1 className="font-display text-2xl text-brown">May we check in with you?</h1>
          <p className="text-brown/70 text-sm mt-2">
            Just before your six-week follow-up and again at four months, we&rsquo;ll ask you to answer the questions again, so you and we can see what changed.
          </p>
          <label className="flex items-start gap-3 mt-5 text-sm text-brown">
            <input type="checkbox" className="mt-1" defaultChecked />
            Yes, Mandi may contact me about my check-ins if I don&rsquo;t answer.
          </label>
          <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown mt-3" placeholder="Cellphone (optional)" />
          <label className="flex items-start gap-3 mt-3 text-sm text-brown">
            <input type="checkbox" className="mt-1" defaultChecked />
            You may WhatsApp me. We never send health information by WhatsApp or text.
          </label>
          <Link href="/join/share" className="block text-center mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Continue
          </Link>
        </div>
      </main>
    </>
  );
}
