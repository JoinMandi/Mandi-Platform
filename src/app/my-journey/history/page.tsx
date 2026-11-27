import Link from "next/link";
import NavBar from "@/components/NavBar";

const blankets = [
  { score: 40, band: "Moderate", when: "7 May · four months" },
  { score: 51, band: "Moderate", when: "15 Feb · six weeks" },
  { score: 64, band: "Significant", when: "14 Dec · where you started" },
];

export default function HistoryPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/my-journey" className="text-terra text-sm">
            ← My Mandi
          </Link>
          <h1 className="font-display text-3xl text-brown mt-3">All my blankets</h1>
          <p className="text-brown/70 text-sm mt-1 mb-6">
            Every time you answer, a new blanket. Pick two to see them side by side.
          </p>

          <div className="space-y-3">
            {blankets.map((b) => (
              <div
                key={b.when}
                className="bg-cream-soft rounded-3xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-3xl text-brown">{b.score}</span>
                  <div>
                    <p className="text-brown font-medium">{b.band}</p>
                    <p className="text-brown/60 text-sm">{b.when}</p>
                  </div>
                </div>
                <span className="text-terra text-sm">Select</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button className="rounded-full bg-terra text-white px-5 py-2 text-sm">
              Compare two blankets
            </button>
            <button className="rounded-full border border-brown/20 text-brown px-5 py-2 text-sm">
              Download my history
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
