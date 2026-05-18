import Image from "next/image";
import NavBar from "@/components/NavBar";

export default function AboutPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">

        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <div className="absolute inset-0 bg-brown/15" />
          <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-center">
            <p className="text-cream/85 text-[11px] font-semibold uppercase tracking-[0.25em] mb-4">About Mandi</p>
            <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
              A name that belongs<br />to all of us.
            </h1>
          </div>
        </section>

        {/* The name */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">The Name</p>
          <p className="font-display text-3xl text-brown leading-snug mb-6">
            Mandi is the common thread that runs through us all.
          </p>
          <p className="text-brown/80 text-base leading-relaxed mb-4">
            In Afrikaans, it is a short form of Amanda. In isiXhosa, it is drawn from Mandisa.
            Different languages, different communities, different lived experiences — and yet here we are,
            the same women, navigating the same bodies, deserving the same care.
          </p>
          <p className="text-brown/80 text-base leading-relaxed mb-4">
            We chose a name beginning with <strong>M</strong> to anchor this project in <strong>Menopause</strong> —
            the life stage that sparked this mission. But Mandi was always meant to grow beyond that first chapter.
            Because hormonal health does not begin and end with menopause. It is a lifelong journey, and every
            woman deserves a trusted companion for the entirety of it.
          </p>
          <p className="text-brown font-semibold text-base">Mandi is that companion. For all of us.</p>
        </section>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-golden/40 w-full" />
        </div>

        {/* Hermi's story */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">Where This Began</p>
          <p className="font-display text-3xl text-brown leading-snug mb-8">
            This platform was born from a personal story.
          </p>

          <div className="flex flex-col sm:flex-row gap-10 items-start mb-10">
            <div className="flex-1 space-y-5 text-brown/80 text-base leading-relaxed">
              <p>
                In my late 40s, I mentioned heart palpitations to two older colleagues over lunch. One immediately
                suggested I see a heart specialist. The other said it was just part of getting older. Neither
                mentioned menopause. Neither mentioned that heart palpitations are one of the over 100 recognised
                symptoms of hormonal change. I had no idea.
              </p>
              <p>
                Soon thereafter I moved to Cape Town at the age of 50, ready for exciting new adventures. Instead,
                I ended up in hospital with a severe kidney infection caused by a bladder infection. I saw a
                urologist. My GP. A gynaecologist. Not one of them asked whether I was on HRT. Not one of them
                connected my recurring infections to my hormones — even though the link is well established.
                They treated my symptoms, not the cause.
              </p>
              <p>
                I endured years of joint pain, brain fog, mood swings, UTIs, painful sex, hot flushes, dry eyes,
                and many more symptoms.
              </p>
              <p>
                Then I went online. I found Dr Louise Newson. Dr Mary Claire Haver. Dr Lisa Mosconi. And many more.
                I started telling all my friends to find help. My husband calls me a menopause evangelist.
              </p>
            </div>
            <div className="sm:w-52 flex-shrink-0">
              <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-lg">
                <Image src="/images/woman-cycling.jpg" alt="A woman living fully" fill className="object-cover" />
              </div>
            </div>
          </div>

          <div className="bg-golden/20 rounded-2xl px-8 py-6 border-l-4 border-golden mb-10">
            <p className="text-brown/80 text-base leading-relaxed italic">
              &ldquo;Once you know better, you can do better.&rdquo;
            </p>
            <p className="text-brown/60 text-sm mt-2">— Maya Angelou</p>
          </div>

          <div className="space-y-5 text-brown/80 text-base leading-relaxed">
            <p>
              This motivated me to pitch a documentary series to kykNET called{" "}
              <em>Meer As Warm Gloede</em> — a four-part documentary series launching in August 2026.
              It breaks the silence around menopause in Afrikaans-speaking communities, tells real stories
              from real women, and gives viewers the knowledge and confidence to take their health into
              their own hands.
            </p>
            <p>
              The documentary opened doors. More research led me to discover MIDI in the United States —
              a platform that has recently achieved unicorn status, serving hundreds of thousands of women
              across all 50 states. That realisation set something in motion.
            </p>
            <p>
              I am now embarking on this journey with some incredible women to build our own South African
              equivalent: <strong>JoinMandi.com</strong>.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-golden/40 w-full" />
        </div>

        {/* Vision */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-6">The Vision</p>
          <p className="font-display text-3xl text-brown leading-snug mb-6">
            JoinMandi.com is more than a website. It is a movement.
          </p>
          <p className="text-brown/80 text-base leading-relaxed mb-4">
            It is the belief that every South African woman — in Parow or Polokwane, in Soweto or Stellenbosch,
            whether she speaks Afrikaans, isiZulu, isiXhosa, or any of the other languages that make this country
            extraordinary — deserves to understand what is happening in her own body, in a language that feels
            like home.
          </p>
          <p className="text-brown/80 text-base leading-relaxed mb-10">
            South Africa has 11 official languages. Most digital health platforms offer one: English. That is not
            good enough. Mandi is built to grow with the country — into every community where women have been
            left without informed answers and proper medical care.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { lang: "English", label: "Talk to Mandi" },
              { lang: "isiZulu", label: "Khuluma noMandi" },
              { lang: "isiXhosa", label: "Thetha noMandi" },
              { lang: "Afrikaans", label: "Praat met Mandi" },
            ].map((l) => (
              <div key={l.lang} className="bg-white/60 border border-golden/30 rounded-2xl px-6 py-4 flex items-center justify-between">
                <span className="font-semibold text-brown">{l.label}</span>
                <span className="text-xs text-brown/50 bg-golden/20 px-2 py-0.5 rounded-full">{l.lang}</span>
              </div>
            ))}
          </div>
        </section>

        {/* No woman alone */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk">
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
            <p className="font-display text-3xl sm:text-4xl text-cream leading-tight">
              No woman should feel alone, uninformed, or unsupported during menopause and beyond.
            </p>
            <p className="text-golden mt-6 text-sm font-semibold uppercase tracking-[0.2em]">
              A project from The Yolk! · MrsKing Productions
            </p>
          </div>
        </section>

        {/* Mandi blanket image */}
        <section className="max-w-3xl mx-auto px-6 py-16 flex flex-col sm:flex-row gap-10 items-center">
          <div className="relative h-64 w-full sm:w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
            <Image src="/images/mandi-blanket.jpg" alt="The Mandi Blanket — different fabrics, one community" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-terra mb-4">The Mandi Blanket</p>
            <p className="text-brown/80 text-base leading-relaxed">
              The central visual metaphor for Mandi is a quilt — a blanket made of different fabrics, different
              textures, different traditions, stitched together into something whole, warm, and beautiful.
              Just like Mandi. Just like South Africa.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-brown py-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="font-display text-cream text-3xl mb-6">Ready to begin your journey?</p>
            <a
              href="/"
              className="inline-block bg-terra text-cream font-semibold rounded-full px-10 py-4 text-base hover:bg-terra-dark transition-colors shadow-warm-lg"
            >
              Talk to Mandi
            </a>
          </div>
        </section>

      </main>
    </>
  );
}
