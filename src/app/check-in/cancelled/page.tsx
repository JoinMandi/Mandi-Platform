import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function CancelledPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Your membership is cancelled</h1>
          <p className="text-brown/70 text-sm mt-1">You won&rsquo;t be charged again. Everything keeps working until the end of what you&rsquo;ve paid for.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-4 text-sm text-brown space-y-2">
            <p>Download all your blankets and your doctor summary as one PDF.</p>
            <p>Book anything you still need with Dr Naledi.</p>
            <p>After that, your blanket on this device and your downloads stay yours. You can come back any time.</p>
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/summary" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Download everything</Link>
            <Link href="/my-journey" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Back to my home</Link>
          </div>
        </div>
      </main>
    </>
  );
}
