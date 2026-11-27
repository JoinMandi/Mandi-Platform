import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function PayPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <div className="bg-cream-soft rounded-3xl p-6">
            <p className="text-brown/60 text-sm">Mandi membership, monthly</p>
            <p className="font-display text-3xl text-brown mt-1">R149.00 <span className="text-sm text-brown/60">/ month</span></p>
            <div className="mt-5 space-y-3">
              <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Card number" />
              <div className="flex gap-3">
                <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="MM / YY" />
                <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="CVV" />
              </div>
            </div>
            <Link href="/join/success" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm font-semibold">
              Pay R149.00
            </Link>
            <p className="text-brown/50 text-xs text-center mt-2">Secured by Paystack · card only</p>
            <Link href="/join/failed" className="block text-center text-brown/50 text-xs mt-4">
              Simulate a failed payment
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
