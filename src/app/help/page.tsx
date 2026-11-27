import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function HelpPage() {
  const items = [
    { href: "/help/hermi", title: "Hermi", sub: "Booking, medical aid, what's next" },
    { href: "/my-doctor", title: "Your doctor", sub: "Health, symptoms, medicines, results" },
    { href: "/help/medical-aid", title: "Help with my medical aid", sub: "What it covers, what to ask, how to claim" },
    { href: "/help/partner", title: "A guide for my partner or family", sub: "Five minutes to read" },
  ];
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-display text-3xl text-brown">Help</h1>
          <div className="space-y-3 mt-5">
            {items.map((i) => (
              <Link key={i.href} href={i.href} className="block bg-cream-soft rounded-3xl p-5 text-brown">
                <p className="font-semibold">{i.title}</p>
                <p className="text-brown/60 text-sm">{i.sub}</p>
              </Link>
            ))}
          </div>
          <p className="text-brown/60 text-xs mt-5">In crisis: SADAG 0800 567 567, any time · emergency 112</p>
        </div>
      </main>
    </>
  );
}
