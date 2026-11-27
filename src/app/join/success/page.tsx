import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function SuccessPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <h1 className="font-display text-3xl text-brown">Welcome to Mandi</h1>
          <p className="text-brown/70 text-sm mt-2">
            Your first payment of R149 went through. Paystack will email you a receipt. We&rsquo;re so glad you&rsquo;re here.
          </p>
          <Link href="/join/account" className="block mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Create my account
          </Link>
        </div>
      </main>
    </>
  );
}
