import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

const FOUNDERS = [
  {
    name: "Hermi King",
    role: "FOUNDER AND CO-CEO",
    initials: "HK",
    bio: "Television producer, documentary filmmaker and qualified lawyer, with more than 22 years in South African production. Four years deep in the global menopause research and clinical community, and the maker of Meer as Warm Gloede.",
    linkedin: "https://www.linkedin.com/in/hermi-king-064a9623/",
    bar: "linear-gradient(90deg,#FFD66B,#FFAA4F)",
  },
  {
    name: "Evelien Griffioen",
    role: "CO-FOUNDER AND CO-CEO",
    initials: "EG",
    bio: "Product strategist and designer with 15+ years of global experience, ex-head of Customer Insights and Experience at Yoco, ex-mentor at StartUpBootcamp Barcelona. Evelien has a BSc Industrial Design Engineering and a MSc Strategic Product Design (with distinction) from the Delft University of Technology in The Netherlands. She designs the journey a woman takes through Mandi, from the first question to her doctor's follow-up.",
    linkedin: "https://www.linkedin.com/in/eveliengriffioen/",
    bar: "linear-gradient(90deg,#FFAA4F,#F7894F)",
  },
  {
    name: "Busi Ndlovu",
    role: "CO-FOUNDER AND CTO",
    initials: "BN",
    bio: "Built the Mandi platform from the very beginning. BCom Honours in Information Systems at UCT, going on to a master's in FinTech, and a hackathon-winning developer across web and mobile.",
    linkedin: "https://www.linkedin.com/in/busisiwe-ndlovu-6a21b6258/",
    bar: "linear-gradient(90deg,#F7894F,#C9562F)",
  },
] as const;

const ADVISERS = [
  {
    name: "Dr Mary Atkinson",
    role: "THE MANDI DOCTOR",
    bio: "A South African GP and functional medicine doctor who guides Mandi's clinical content and safety. She has joined Dr Louise Newson on her podcast to talk about why women deserve better information on their hormones.",
    linkedin: "https://www.linkedin.com/in/dr-mary-atkinson-5939913/",
    bar: "linear-gradient(90deg,#FFD66B,#FFAA4F)",
  },
  {
    name: "Dr Chantal Hadfield",
    role: "STRATEGIC ADVISER",
    bio: "Medical doctor and healthcare executive (Corvalia Health), with experience across telehealth, retail pharmacy and medical schemes.",
    linkedin: "https://www.linkedin.com/in/chantal-lourenco-hadfield/",
    bar: "linear-gradient(90deg,#FFAA4F,#F7894F)",
  },
  {
    name: "Liesel Dower",
    role: "BOARD MEMBER AND INVESTOR",
    bio: "Mandi's first investor and Chairwoman of the Board. She backed the pilot from the start, and is passionate about helping women get the care and support they deserve at every stage of life.",
    linkedin: "https://www.linkedin.com/in/liesel-dower-1325ab152/",
    bar: "linear-gradient(90deg,#F7894F,#C9562F)",
  },
] as const;

const STRIP_COLOURS = [
  "#FFD66B",
  "#F47B4C",
  "#FFAA4F",
  "#C9562F",
  "#FCE79A",
  "#E2805C",
  "#F2C14E",
  "#673C33",
];
const STRIP = Array.from(
  { length: 24 },
  (_, i) => STRIP_COLOURS[(i * 5 + (i % 3)) % STRIP_COLOURS.length],
);

function LinkedInIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="#0A66C2" className="h-4 w-4">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z" />
    </svg>
  );
}

function LinkedInLink({ href, name }: { href: string; name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`${name} on LinkedIn`}
      className="mt-1 inline-flex items-center gap-2 self-start rounded-full border-[1.5px] border-cream-deep bg-white px-4 py-2.5 text-sm font-bold text-brown no-underline shadow-[0_4px_12px_rgba(140,60,30,0.08)]"
    >
      <LinkedInIcon />
      LinkedIn
    </a>
  );
}

function Portrait({ name, initials }: { name: string; initials: string }) {
  return (
    <div
      role="img"
      aria-label={name}
      className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 42%), radial-gradient(circle at 80% 85%, rgba(103,60,51,0.18) 0%, rgba(103,60,51,0) 40%), linear-gradient(135deg,#FFD66B 0%,#FFAA4F 55%,#F47B4C 100%)",
      }}
    >
      <span className="font-word text-6xl font-extrabold text-brown/70 sm:text-7xl">
        {initials}
      </span>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-sans text-brown">
      <div className="relative overflow-clip bg-mandi-hero">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-60 -top-[380px] h-[820px] w-[820px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_70%)]"
        />
        <SiteHeader
          variant="page"
          active="about"
          cta={{ href: "/v4/language", label: "Get my MenoScore" }}
        />

        <section className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-5 pb-24 pt-10 sm:px-10 sm:pb-28 sm:pt-14 xl:flex-row xl:items-end xl:gap-16">
          <div className="flex min-w-0 flex-col gap-[22px] xl:flex-[999_1_600px]">
            <span className="text-[11px] font-bold tracking-[0.3em] sm:text-xs">
              OUR STORY
            </span>
            <h1 className="font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.04em] sm:text-[54px] sm:tracking-[-1.4px] xl:text-[62px] xl:tracking-[-1.8px]">
              Changing menopause care for every South African woman
            </h1>
            <p className="max-w-[640px] text-base font-medium leading-relaxed sm:text-[20px] sm:leading-[1.55]">
              We help women understand what their hormones are doing, in their
              own language, and connect them with doctors trained in menopause
              care. Every answer, shared with her consent, builds South Africa&apos;s
              own picture of women&apos;s hormone health, so care here is shaped by
              our women, not by data from elsewhere.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3.5 rounded-2xl bg-cream p-6 sm:p-7 xl:max-w-[360px] xl:flex-[1_1_320px]">
            <span className="text-[11px] font-bold tracking-[0.22em] text-terra">
              WHY “MANDI”?
            </span>
            <p className="text-[15px] leading-relaxed sm:text-base sm:leading-[1.6]">
              Amanda in Afrikaans, Mandisa in isiXhosa. M for menopause, and a
              friend you can talk to.
            </p>
            <p className="border-t border-[#EBD3BC] pt-3.5 text-sm font-semibold leading-relaxed text-terra">
              Talk to Mandi · Khuluma noMandi · Thetha noMandi · Praat met Mandi
            </p>
          </div>
        </section>
      </div>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 pb-20 pt-20 sm:px-10 sm:pb-24 sm:pt-28 xl:flex-row xl:items-start xl:gap-16">
        <div className="flex flex-col gap-3.5 xl:w-[300px] xl:flex-shrink-0">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            HOW IT STARTED
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            It started with a documentary
          </h2>
        </div>

        <div className="flex flex-col gap-[22px] border-l-2 border-flame pl-5 text-[16px] leading-relaxed sm:text-lg sm:leading-[1.75] xl:flex-1 xl:pl-8">
          <p>
            For four years Hermi King followed the global research on menopause,
            and kept meeting women who had been told their symptoms were stress,
            age or something to put up with. That became{" "}
            <em>Meer as Warm Gloede</em>, a four-part documentary for kykNET.
          </p>
          <p>
            The women in it said the same thing in different words: I didn&apos;t
            know this was hormones, and I didn&apos;t know who to ask. The
            national guide every public clinic works from barely mentions
            perimenopause. Too many women leave their jobs at the moment they
            know the most.
          </p>
          <p>
            So we built Mandi. She answers honestly, sees herself on her own
            Mandi blanket, and gets something clear she can act on, with a doctor
            who listens. We start with menopause, and we are building towards a
            lifelong record of a woman&apos;s hormonal health.
          </p>
          <p className="mt-2 text-[22px] font-light leading-snug tracking-[-0.01em] text-[#C9562F] sm:text-[26px] sm:leading-[1.45]">
            Mandi is built for every African woman: in her own language, in her
            own world, and walking beside her.
          </p>
        </div>
      </section>

      <div
        aria-hidden
        className="mx-auto grid max-w-[1200px] gap-1.5 px-5 sm:px-10"
        style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
      >
        {STRIP.map((background, index) => (
          <span key={index} className="h-3.5 rounded" style={{ background }} />
        ))}
      </div>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 pb-20 pt-24 sm:px-10 sm:pb-20">
        <div className="flex flex-col gap-3.5">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            THE FOUNDERS
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            Building the care we wish our mothers had
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {FOUNDERS.map((founder) => (
            <article key={founder.name} className="flex flex-col gap-3.5">
              <Portrait name={founder.name} initials={founder.initials} />
              <span
                aria-hidden
                className="h-1 rounded-full"
                style={{ background: founder.bar }}
              />
              <h3 className="text-xl font-bold sm:text-[22px]">{founder.name}</h3>
              <span className="text-[11px] font-bold tracking-[0.22em] text-terra">
                {founder.role}
              </span>
              <p className="text-[15px] leading-relaxed">{founder.bio}</p>
              <LinkedInLink href={founder.linkedin} name={founder.name} />
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#FFF3E2]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-24 sm:px-10 sm:pb-28">
          <div className="flex flex-col gap-3.5">
            <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
              ADVISERS
            </span>
            <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
              The people keeping us honest
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ADVISERS.map((adviser) => (
              <article key={adviser.name} className="flex flex-col gap-3">
                <span
                  aria-hidden
                  className="h-1 rounded-full"
                  style={{ background: adviser.bar }}
                />
                <h3 className="mt-1.5 text-lg font-bold sm:text-[19px]">
                  {adviser.name}
                </h3>
                <span className="text-[11px] font-bold tracking-[0.22em] text-terra">
                  {adviser.role}
                </span>
                <p className="text-sm leading-relaxed">{adviser.bio}</p>
                <LinkedInLink href={adviser.linkedin} name={adviser.name} />
              </article>
            ))}

            <article className="flex flex-col gap-3">
              <span
                aria-hidden
                className="h-1 rounded-full border-t-2 border-dashed border-[#F7A267]"
              />
              <h3 className="mt-1.5 text-lg font-bold sm:text-[19px]">
                More to come
              </h3>
              <span className="text-[11px] font-bold tracking-[0.22em] text-terra">
                2027
              </span>
              <p className="text-sm leading-relaxed">
                We&apos;re adding technical and commercial advisers in 2027.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-mandi-hero">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-5 py-24 text-center sm:px-10 sm:py-28">
          <span className="text-[11px] font-bold tracking-[0.3em] sm:text-xs">
            WITH THANKS
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.2] tracking-[-0.5px] sm:text-[38px]">
            To every woman who told us her story so that others could be heard
          </h2>
        </div>
      </section>

      <SiteFooter variant="page" />
    </div>
  );
}
