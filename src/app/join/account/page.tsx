import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function AccountPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-brown/60 text-sm">1 of 3</p>
          <h1 className="font-display text-2xl text-brown">Your Mandi account</h1>
          <p className="text-brown/70 text-sm mt-1">
            Your blanket from this device moves into your account, so it&rsquo;s safe on any device.
          </p>
          <div className="mt-5 space-y-3">
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Email" />
            <input className="w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-sm text-brown" placeholder="Password" type="password" />
          </div>
          <Link href="/join/what-matters" className="block text-center mt-5 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Create my account
          </Link>
        </div>
      </main>
    </>
  );
}
