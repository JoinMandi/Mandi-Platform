import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function KeepPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Thank you for telling us</h1>
          <p className="text-brown/70 text-sm mt-1">What you already have is still yours, here on this device.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-5 text-sm text-brown space-y-2">
            <p>Your blanket, MenoScore, results and tips</p>
            <p>Your doctor summary, to download and take to any doctor</p>
            <p>Answer again any time and compare</p>
          </div>
          <p className="text-brown/70 text-sm mt-4">Change your mind? You can join from your results whenever you&rsquo;re ready.</p>
          <div className="flex gap-3 mt-6">
            <Link href="/roadmap" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Back to my blanket</Link>
            <Link href="/summary" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Download my summary</Link>
          </div>
        </div>
      </main>
    </>
  );
}
