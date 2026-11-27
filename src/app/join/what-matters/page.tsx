import Link from "next/link";
import NavBar from "@/components/NavBar";

const options = ["See a doctor", "My daily diary", "Menopause 101"];

export default function WhatMattersPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <p className="text-brown/60 text-sm">2 of 3</p>
          <h1 className="font-display text-2xl text-brown">What&rsquo;s most important to you right now?</h1>
          <p className="text-brown/70 text-sm mt-1">We&rsquo;ll take you there first. Everything else is waiting too.</p>
          <div className="space-y-3 mt-6">
            {options.map((o) => (
              <Link key={o} href="/join/follow-up" className="block bg-cream-soft rounded-3xl p-5 text-brown font-medium">
                {o}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
