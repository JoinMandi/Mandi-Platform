import Link from "next/link";
import NavBar from "@/components/NavBar";

const COLS = ["#d98a4a", "#c2601f", "#e0b060", "#b5c48a", "#8fa3c7", "#d9c27a", "#c9a233", "#a8b7a0"];

export default function BlanketPage() {
  const patches = Array.from({ length: 64 }, (_, i) => ({
    golden: i % 3 === 0,
    color: COLS[i % COLS.length],
  }));

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">
            ← My Mandi
          </Link>
          <h1 className="font-display text-3xl text-brown mt-3">My blanket</h1>

          <div className="bg-golden/20 rounded-3xl p-6 mt-4">
            <p className="text-brown font-semibold">23 patches have turned golden</p>
            <p className="text-brown/70 text-sm">
              Where you feel better than when you started. Sleep changed the most.
            </p>
            <div className="grid grid-cols-8 gap-1 mt-4 p-2 bg-white rounded-xl border border-golden/60">
              {patches.map((p, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ background: p.golden ? "#c9a233" : p.color }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-brown/60 mt-2">
              <span>64 · 14 Dec</span>
              <span>51 · 15 Feb</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/my-journey/history"
              className="rounded-full bg-terra text-white px-5 py-2 text-sm"
            >
              See all my blankets
            </Link>
            <Link
              href="/my-journey"
              className="rounded-full border border-brown/20 text-brown px-5 py-2 text-sm"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
