import NavBar from "@/components/NavBar";
import Image from "next/image";

const CATEGORIES = [
  {
    label: "Understanding Menopause",
    color: "bg-golden/20 text-brown border-golden/40",
  },
  {
    label: "HRT & Treatment",
    color: "bg-terra/10 text-terra border-terra/30",
  },
  {
    label: "Mental Health",
    color: "bg-pink-mandi/10 text-pink-mandi border-pink-mandi/30",
  },
  {
    label: "Nutrition & Lifestyle",
    color: "bg-coral/10 text-terra border-coral/30",
  },
  {
    label: "Research & Evidence",
    color: "bg-brown/10 text-brown border-brown/20",
  },
];

const RESOURCES = [
  {
    category: "Understanding Menopause",
    title: "What is perimenopause?",
    type: "Article",
    description:
      "A clear, evidence-based introduction to the years before menopause — what's happening in your body and why it matters.",
    source: "Mandi Editorial",
    lang: ["en", "af"],
  },
  {
    category: "Understanding Menopause",
    title: "The 100+ symptoms of hormonal change",
    type: "Guide",
    description:
      "Heart palpitations. Joint pain. Brain fog. Dry eyes. This guide covers the full picture — so nothing gets missed.",
    source: "Mandi Editorial",
    lang: ["en"],
  },
  {
    category: "HRT & Treatment",
    title: "Body-identical HRT explained",
    type: "Article",
    description:
      "What body-identical hormones are, how they differ from older synthetic formulations, and what the current evidence says.",
    source: "Mandi Editorial",
    lang: ["en", "af"],
  },
  {
    category: "HRT & Treatment",
    title: "HRT routes of administration",
    type: "Guide",
    description:
      "Patches, gels, tablets, sprays, vaginal preparations — a plain-English guide to your options.",
    source: "Mandi Editorial",
    lang: ["en"],
  },
  {
    category: "Mental Health",
    title: "Hormones and your mood",
    type: "Article",
    description:
      "Anxiety, low mood, and rage that comes from nowhere. Understanding the hormonal connection — and what helps.",
    source: "Mandi Editorial",
    lang: ["en", "zu", "xh"],
  },
  {
    category: "Nutrition & Lifestyle",
    title: "Eating for hormonal health",
    type: "Guide",
    description:
      "Practical nutrition guidance for perimenopause and beyond — what the evidence actually says about food and hormones.",
    source: "Mandi Editorial",
    lang: ["en", "af"],
  },
  {
    category: "Research & Evidence",
    title: "The WHI study — what actually happened",
    type: "Research Summary",
    description:
      "The 2002 study that changed everything — and why the conclusions were misrepresented. A plain-language summary.",
    source: "Mandi Editorial",
    lang: ["en"],
  },
  {
    category: "Research & Evidence",
    title: "Oestrogen and brain health",
    type: "Research Summary",
    description:
      "New research on oestrogen's role in cognitive function and the importance of the 'critical window' of treatment.",
    source: "Based on Dr Lisa Mosconi's research",
    lang: ["en"],
  },
];

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  af: "AF",
  zu: "ZU",
  xh: "XH",
};

export default function ResourcesPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">

        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-16">
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">Resources</p>
            <h1 className="font-display text-5xl sm:text-6xl text-brown leading-[1.05] max-w-2xl">
              Knowledge you can trust.
            </h1>
            <p className="text-brown/75 text-lg mt-5 max-w-xl leading-relaxed">
              Everything here is evidence-based, reviewed for accuracy, and written in plain language.
              No jargon. No judgment. No selling.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-brown/80 text-base leading-relaxed max-w-2xl">
            Everything here is evidence-based, reviewed for accuracy, and written in plain language.
            No jargon. No judgment. No selling you something. Just the information you deserve to have.
          </p>
        </section>

        {/* Category filters */}
        <section className="max-w-4xl mx-auto px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <span
                key={c.label}
                className={`text-xs font-semibold border rounded-full px-4 py-1.5 ${c.color}`}
              >
                {c.label}
              </span>
            ))}
          </div>
        </section>

        {/* Resources grid */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
            {RESOURCES.map((r) => (
              <div
                key={r.title}
                className="bg-cream-soft rounded-3xl shadow-warm p-7 flex flex-col gap-3 hover:shadow-warm-lg hover:-translate-y-0.5 transition-all cursor-pointer group border-l-4 border-coral"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terra">{r.category}</span>
                  <span className="text-[10px] text-brown/40 bg-brown/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">{r.type}</span>
                </div>
                <h3 className="font-display text-lg text-brown group-hover:text-terra transition-colors leading-snug">
                  {r.title}
                </h3>
                <p className="text-sm text-brown/70 leading-relaxed flex-1">{r.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-golden/20">
                  <span className="text-xs text-brown/40">{r.source}</span>
                  <div className="flex gap-1">
                    {r.lang.map((l) => (
                      <span key={l} className="text-xs bg-golden/20 text-brown px-2 py-0.5 rounded-full font-medium">
                        {LANG_LABELS[l]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon notice */}
        <section className="bg-brown/5 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-brown/60 text-sm">
              More resources are added regularly. All content is reviewed by clinical partner{" "}
              <strong className="text-brown">Dr Funeka Bango</strong> before publication.
            </p>
            <p className="text-brown/40 text-xs mt-2">
              Resources in isiZulu and isiXhosa are being developed. If you can help with translation, contact us.
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
