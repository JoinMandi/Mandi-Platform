import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function FailedPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-2xl text-brown">The payment didn&rsquo;t go through</h1>
          <p className="text-brown/70 text-sm mt-2">
            It happens, and it isn&rsquo;t your fault. Usually the bank just didn&rsquo;t approve it. Nothing was taken from your account.
          </p>
          <div className="space-y-3 mt-6">
            <Link href="/join/pay" className="block rounded-full bg-terra text-white px-6 py-3 text-sm">
              Try another card
            </Link>
            <Link href="/join/pay" className="block rounded-full border border-brown/20 text-brown px-6 py-3 text-sm">
              Try the same card again
            </Link>
          </div>
          <p className="text-brown/60 text-xs mt-6">Still stuck? hello@joinmandi.com</p>
        </div>
      </main>
    </>
  );
}
