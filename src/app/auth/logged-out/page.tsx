import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function LoggedOutPage() {
  return (
    <main className="min-h-screen bg-cream">
      <NavBar />
      <div className="flex items-center justify-center px-5 py-24">
        <div className="bg-cream-soft rounded-4xl shadow-warm-xl p-10 max-w-md text-center">
          <h1 className="font-display text-3xl text-brown mb-3">You are signed out.</h1>
          <p className="text-brown/65 text-sm mb-6">
            Your Mandi session has ended.
          </p>
          <Link href="/" className="link-warm text-terra text-sm">
            Back to the site →
          </Link>
        </div>
      </div>
    </main>
  );
}
