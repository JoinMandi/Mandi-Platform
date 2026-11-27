import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function JoinTeamsPage() {
  const steps = [
    "The day before: install the free Microsoft Teams app.",
    "On the day: tap Join on your appointment card or in your email.",
    "Choose Join as a guest. Don't sign in. Type your first name.",
    "Allow camera and microphone when your phone asks.",
    "Wait a moment. Dr Naledi lets you in.",
  ];
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Joining your consultation</h1>
          <p className="text-brown/70 text-sm">You don&rsquo;t need a Microsoft account. You join as a guest.</p>
          <ol className="mt-5 space-y-2 text-sm text-brown list-decimal list-inside">
            {steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <div className="flex gap-3 mt-6">
            <span className="rounded-full border border-brown/20 text-brown px-4 py-2 text-sm">Google Play</span>
            <span className="rounded-full border border-brown/20 text-brown px-4 py-2 text-sm">App Store</span>
          </div>
          <Link href="/my-appointment/lobby" className="block text-center mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Continue
          </Link>
        </div>
      </main>
    </>
  );
}
