import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function DeclinePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-2xl text-brown">Not now. That&rsquo;s fine.</h1>
          <p className="text-brown/70 text-sm mt-1">May we ask why? It helps us make Mandi better. You don&rsquo;t have to answer.</p>
          <div className="space-y-2 mt-5">
            {["Too expensive", "Not sure it's for me", "I'll come back later", "Something else"].map((r) => (
              <button key={r} className="block w-full text-left bg-cream-soft rounded-2xl p-4 text-sm text-brown">
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <Link href="/join/keep" className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Send</Link>
            <Link href="/join/keep" className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Skip</Link>
          </div>
        </div>
      </main>
    </>
  );
}
