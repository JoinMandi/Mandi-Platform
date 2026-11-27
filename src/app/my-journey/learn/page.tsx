import Link from "next/link";
import NavBar from "@/components/NavBar";

const lessons = [
  { n: 1, title: "What is happening in your body", time: "6 min", done: true },
  { n: 2, title: "Sleep, mood and memory", time: "6 min", current: true },
  { n: 3, title: "Hot flushes and night sweats", time: "6 min" },
  { n: 4, title: "Bones, heart and long-term health", time: "7 min" },
  { n: 5, title: "Treatment, HRT and your options", time: "8 min" },
  { n: 6, title: "Talking to your doctor and family", time: "6 min" },
];

export default function LearnPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">
            ← My Mandi
          </Link>
          <h1 className="font-display text-3xl text-brown mt-3">Menopause 101</h1>
          <p className="text-brown/70 text-sm mt-1 mb-6">
            Short lessons in plain words. Watch when it suits you.
          </p>

          <div className="space-y-3">
            {lessons.map((l) => (
              <div
                key={l.n}
                className="bg-cream-soft rounded-3xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-brown font-semibold">
                    {l.n} · {l.title}
                  </p>
                  <p className="text-brown/60 text-sm">{l.time}</p>
                </div>
                <span
                  className={
                    l.done
                      ? "text-xs bg-golden/30 text-brown px-3 py-1 rounded-full"
                      : l.current
                        ? "text-xs bg-terra text-white px-3 py-1 rounded-full"
                        : "text-xs border border-brown/20 text-brown/60 px-3 py-1 rounded-full"
                  }
                >
                  {l.done ? "Done" : l.current ? "Continue" : "Locked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
