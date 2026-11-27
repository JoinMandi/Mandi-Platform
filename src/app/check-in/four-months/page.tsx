import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function FourMonthsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold">Four months</p>
          <h1 className="font-display text-4xl text-brown mt-1">64 · 51 · 40</h1>
          <p className="text-brown/70 text-sm mt-1">From significant to moderate.</p>
          <p className="text-brown/70 text-sm mt-4">
            You were one of the first women to walk this road with Mandi. Thank you. What you shared is already helping the women who come after you.
          </p>
          <Link href="/my-journey" className="inline-block mt-6 rounded-full bg-terra text-white px-6 py-3 text-sm">
            Back to my home
          </Link>
        </div>
      </main>
    </>
  );
}
