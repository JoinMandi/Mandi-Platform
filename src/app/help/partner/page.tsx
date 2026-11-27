import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function PartnerPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-3xl text-brown">A guide for the people who love you</h1>
          <p className="text-brown/70 text-sm">Help your partner or family understand what you&rsquo;re going through.</p>
          <div className="bg-cream-soft rounded-3xl p-5 mt-4 text-sm text-brown space-y-2">
            <p><strong>1 · What is happening.</strong> Perimenopause in plain words.</p>
            <p><strong>2 · What she might feel.</strong> Sleep, mood, memory, and why.</p>
            <p><strong>3 · What helps.</strong> Listen first. Ask what she needs.</p>
            <p><strong>4 · What doesn&rsquo;t help.</strong> &ldquo;It&rsquo;s just your age.&rdquo;</p>
            <p className="text-brown/60">About five minutes to read. It shares nothing about you: no answers, no score.</p>
          </div>
          <div className="flex gap-3 mt-6">
            <span className="flex-1 text-center rounded-full bg-terra text-white px-5 py-3 text-sm">Share on WhatsApp</span>
            <span className="flex-1 text-center rounded-full border border-brown/20 text-brown px-5 py-3 text-sm">Download the guide</span>
          </div>
        </div>
      </main>
    </>
  );
}
