import Image from "next/image";
import Link from "next/link";
import DoctorApplicationForm from "@/components/site/DoctorApplicationForm";
import DoctorVideo from "@/components/site/DoctorVideo";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

const PILOT_STATS = [
  { value: "Only 5", label: "places on our founding panel" },
  { value: "R16,000", label: "Value of the training covered by Mandi" },
  { value: "4 months", label: "How long our pilot runs" },
  { value: "Up to 10", label: "Mandi patients to start with" },
] as const;

const VALUES = [
  {
    icon: "cap",
    title: "Training covered",
    body: "Mandi pays for your Confidence in Hormones course from Newson Education, and you join regular sessions with the other Mandi doctors to stay up to date.",
  },
  {
    icon: "card",
    title: "You bill her",
    body: "Within what medical aids cover, including quick 15-minute appointments. Mandi takes no cut of your fee.",
  },
  {
    icon: "clipboard",
    title: "You lead the plan",
    body: "Her summary informs your consultation; it never replaces it. You evaluate and prescribe, and she decides with you.",
  },
  {
    icon: "video",
    title: "Online",
    body: "We match her with you by language within 48 hours. A 30-minute first appointment, then a six-week follow-up.",
  },
] as const;

const MODULES = [
  {
    n: "01",
    title: "Hormones 101",
    body: "How estrogen, progesterone and testosterone work, and what changes in perimenopause.",
  },
  {
    n: "02",
    title: "Hormones in Practice",
    body: "Running the consultation, choosing treatment and following up well.",
  },
  {
    n: "03",
    title: "Individualising Clinical Decision Making",
    body: "Women with a history of breast cancer, clots or other complexities.",
  },
  {
    n: "04",
    title: "Mental Health, Wellbeing and Hormones",
    body: "Telling hormonal low mood and anxiety apart, and treating them.",
  },
  {
    n: "05",
    title: "Understanding the roles of Testosterone in Women",
    body: "When and how to prescribe testosterone for women.",
  },
] as const;

const STEPS = [
  {
    n: 1,
    title: "She tells her story",
    body: "She answers 56 questions and adds her medical history, medicines and family history.",
  },
  {
    n: 2,
    title: "We match her with you",
    body: "By language and place, within 48 hours. She books a slot from your calendar.",
  },
  {
    n: 3,
    title: "You read her summary",
    body: "Before you say hello, you know her score, her hardest areas and any flags.",
  },
  {
    n: 4,
    title: "You see her online",
    body: "30 minutes on Microsoft Teams. You agree the plan and prescribe, then send us a short outcome form.",
  },
  {
    n: 5,
    title: "Six weeks later",
    body: "Her follow-up is booked at the first appointment. She answers again first, so you see what changed.",
  },
  {
    n: 6,
    title: "Four months later",
    body: "We check in with her again. She answers once more, so you both see how far she has come.",
  },
] as const;

const SUMMARY_ITEMS = [
  "MenoScore and hardest areas",
  "Safety and specialist flags",
  "Medical and family history",
  "30 days of her symptom diary",
] as const;

const GET = [
  "Menopause training, paid for by Mandi",
  "A monthly honorarium during the pilot",
  "Women who arrive prepared, with their history in front of you",
  "A panel of peers, and regular sessions on the latest research",
  "Your own fee, billed by you. Mandi takes no cut",
  "A part in building South African evidence on what works",
] as const;

const ASK = [
  "A GP registered with the HPCSA, with proof of indemnity cover",
  "Complete five training modules, roughly 30 hours",
  "Availability to see at least 10 Mandi patients online, including some evening slots",
  "Charge within what medical aids cover",
  "Send a short outcome form within 24 hours of each appointment",
  "Book her six-week follow-up at the first appointment",
  "Sign Mandi's data-sharing agreement",
] as const;

const TIMELINE = [
  {
    when: "14 DECEMBER",
    what: "The platform opens with the kykNET documentary",
  },
  {
    when: "DECEMBER 2026",
    what: "Training, and a full dry run with you",
  },
  { when: "5 JANUARY 2027", what: "Women can book Mandi doctors" },
] as const;

const FAQ = [
  {
    q: "Who keeps the clinical record?",
    a: "You do. Her clinical record lives in your own practice system, as it would for any patient. After each appointment you send Mandi a short outcome form: the treatment plan and her follow-up date, so we can support her between visits and learn what works. A data-sharing agreement, signed by every Mandi doctor, sets out exactly what is shared and why.",
  },
  {
    q: "What if I go on holiday?",
    a: "Another Mandi doctor covers for you, so she is never left without care. She decides what the covering doctor sees: with her consent, she shares her Mandi summary and symptom diary, so they can pick up where you left off. Nothing is shared without her say-so.",
  },
  {
    q: "Am I covered online?",
    a: "Online consultations are allowed under the HPCSA telehealth guidelines (Booklet 10), within your scope and to the same standard as in person. Medical Protection says it supports South African members doing telehealth with patients in South Africa, on secure platforms. Cover is decided case by case, so confirm with your own provider, especially for first appointments with new patients. We ask for proof of cover before you start.",
  },
  {
    q: "How does she claim from her medical aid?",
    a: "You bill her as usual and help with any form her scheme needs. Mandi helps her understand what her scheme covers.",
  },
  {
    q: "How much time does it take?",
    a: "Training is five modules, roughly 30 hours. Then you see at least 10 Mandi patients: 30 minutes for each first appointment and 15 minutes for each follow-up. Your own admin, such as billing, comes on top.",
  },
  {
    q: "Can I keep my own patients?",
    a: "Yes. Mandi adds to your practice; it does not replace it. Your own patients can use Mandi too.",
  },
] as const;

const DIARY = Array.from({ length: 30 }, (_, i) => ({
  color: i < 14 ? "#F47B4C" : "#FFC04D",
  height: Math.round(88 - i * 1.6 - ((i * 7) % 5) * 4),
}));

function ValueIcon({ id }: { id: string }) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#C9562F",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-8 w-8",
  };
  if (id === "cap") {
    return (
      <svg {...common}>
        <path d="M2 9l10-5 10 5-10 5z" />
        <path d="M6 11v5c3 2 9 2 12 0v-5" />
      </svg>
    );
  }
  if (id === "card") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }
  if (id === "clipboard") {
    return (
      <svg {...common}>
        <path d="M9 3h6v4H9z" />
        <path d="M7 5H5v16h14V5h-2" />
        <path d="M9 13l2 2 4-4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="5" width="13" height="12" rx="2" />
      <path d="M16 10l5-3v10l-5-3" />
    </svg>
  );
}

export default function DoctorsPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-sans text-brown">
      <div className="relative overflow-clip bg-mandi-hero">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-60 -top-[380px] h-[820px] w-[820px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_70%)]"
        />
        <SiteHeader
          variant="page"
          active="doctors"
          cta={{ href: "#join", label: "Join the panel" }}
        />

        <section className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-5 pb-28 pt-10 sm:px-10 sm:pb-32 sm:pt-14 xl:flex-row xl:items-center xl:gap-16">
          <div className="flex min-w-0 flex-col gap-[22px] xl:flex-[1_1_420px]">
            <span className="text-[11px] font-bold tracking-[0.3em] sm:text-xs">
              FOR GPs
            </span>
            <h1 className="font-display text-[42px] font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-[56px] sm:tracking-[-1.6px] xl:text-[68px] xl:tracking-[-2px]">
              Become a Mandi doctor
            </h1>
            <p className="text-lg font-medium leading-snug sm:text-[22px] sm:leading-[1.45]">
              She arrives informed, in her own language. You build the plan
              together.
            </p>
            <p className="max-w-[460px] text-[15px] leading-relaxed sm:text-base sm:leading-[1.65]">
              Mandi is building a small panel of GPs trained in menopause care.
              We do the listening before the consultation, so your 30 minutes go
              to the plan.
            </p>
            <Link
              href="#join"
              className="mt-2 self-start rounded-full bg-brown px-7 py-4 text-sm font-bold text-[#FFF5E6] no-underline sm:text-base"
            >
              Join the Mandi doctor panel
            </Link>
          </div>

          <DoctorVideo />
        </section>
      </div>

      <section
        aria-label="The pilot in numbers"
        className="mx-auto grid max-w-[1200px] grid-cols-2 gap-y-8 border-b border-[#EBD3BC] px-5 py-14 sm:px-10 lg:grid-cols-4"
      >
        {PILOT_STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-1.5 px-4 ${
              index % 2 === 1 ? "border-l border-[#EBD3BC] lg:border-l" : ""
            } ${index >= 2 ? "border-t border-[#EBD3BC] pt-6 lg:border-t-0 lg:pt-0" : ""}`}
          >
            <span className="whitespace-nowrap text-[30px] font-light tracking-[-0.03em] text-[#C9562F] sm:text-[40px]">
              {stat.value}
            </span>
            <span className="text-sm leading-snug">{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-8 px-5 py-24 sm:px-10 sm:py-28 xl:flex-row xl:gap-16">
        <div className="flex flex-col gap-3.5 xl:w-[360px] xl:flex-shrink-0">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            WHY THIS MATTERS
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            A real chance to change how women are cared for
          </h2>
        </div>
        <div className="flex flex-col gap-[18px] border-l-2 border-flame pl-5 sm:text-[22px] sm:leading-[1.6] xl:flex-1 xl:pl-8">
          <p className="text-lg leading-relaxed">
            Every woman goes through menopause, yet most go from doctor to doctor
            before anyone connects her symptoms to her hormones. The national
            primary care guide barely mentions perimenopause, and medical training
            spends little time on it.
          </p>
          <p className="text-lg font-semibold leading-relaxed">
            As one of our founding doctors, you help change that. Women arrive
            informed, you build the plan together, and we measure how she feels
            four months on. What we prove together becomes the model for care
            across South Africa.
          </p>
          <p className="text-xs leading-relaxed text-brown-muted">
            Sources: APC 2026 v4.1, p. 187 · Matina et al., Global Public Health
            2024 · Drew et al., Climacteric 2025
          </p>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 pb-24 sm:px-10 sm:pb-28">
        <div className="flex flex-col gap-3.5">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            WHAT IT MEANS
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            Your practice. Your fee. Your judgement.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {VALUES.map((value, index) => (
            <div
              key={value.title}
              className={`flex flex-col gap-3.5 ${
                index > 0 ? "lg:border-l lg:border-[#EBD3BC] lg:pl-7" : ""
              } ${index < VALUES.length - 1 ? "lg:pr-7" : ""}`}
            >
              <ValueIcon id={value.icon} />
              <h3 className="text-lg font-bold">{value.title}</h3>
              <p className="text-[15px] leading-relaxed">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#FFF3E2]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-24 sm:px-10 sm:py-28">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:gap-16">
            <div className="flex flex-col gap-[18px] xl:flex-[999_1_560px]">
              <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
                YOUR TRAINING, ON US
              </span>
              <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[44px] sm:tracking-[-1px]">
                Become the GP women are looking for
              </h2>
              <p className="text-[16px] leading-relaxed sm:text-lg sm:leading-[1.7]">
                Most of us had very little hormone training at medical school. As
                a Mandi doctor you complete <b className="font-bold">Confidence in Hormones</b>{" "}
                from Newson Education, founded by Dr Louise Newson, the menopause
                specialist behind the balance app. It is CPD-accredited, free of
                pharmaceutical sponsorship, and paid for in full by Mandi.
              </p>
              <p className="text-[16px] leading-relaxed sm:text-lg sm:leading-[1.7]">
                It is practical and case-based, built around real consultations,
                so you can prescribe body-identical hormones with confidence,
                including testosterone, and tailor care for women with more
                complex histories.
              </p>
            </div>

            <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-7 xl:max-w-[300px] xl:flex-shrink-0">
              {[
                { value: "5", label: "modules" },
                { value: "30+ h", label: "of learning" },
                { value: "Online", label: "at your own pace" },
                { value: "0 ZAR", label: "paid for by Mandi" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1 border-t border-[#E4B98F] pt-3.5"
                >
                  <dt className="text-[28px] font-light text-[#C9562F] sm:text-[34px]">
                    {item.value}
                  </dt>
                  <dd className="text-sm">{item.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
              WHAT YOU WILL COVER
            </h3>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
              {MODULES.map((module, index) => (
                <li
                  key={module.n}
                  className={`flex flex-col gap-2.5 border-t-2 border-[#F47B4C] pt-4 ${
                    index > 0 ? "lg:border-l lg:border-[#E4B98F] lg:pl-5" : ""
                  } ${index < MODULES.length - 1 ? "lg:pr-5" : ""}`}
                >
                  <span className="text-xs font-bold tracking-[0.14em] text-terra">
                    {module.n}
                  </span>
                  <h4 className="text-base font-bold leading-snug">
                    {module.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-brown-soft">
                    {module.body}
                  </p>
                </li>
              ))}
            </ol>

            <div className="flex flex-col gap-4 border-t border-[#E4B98F] pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-sm leading-relaxed">
                Taught by Newson clinicians, including Dr Louise Newson, Dr
                Rebecca Lewis and Dr Holly Carding. 30+ hours online, in English,
                with CPD points available. When you finish, you join a panel of
                GPs who share what they are learning, case by case.
              </p>
              <a
                href="https://www.newsoneducation.co.uk/program/confidence-in-hormones-module-bundle"
                target="_blank"
                rel="noopener"
                className="flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-coral pb-1 text-sm font-bold text-brown no-underline"
              >
                See the modules at Newson Education
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C9562F"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-14 px-5 py-24 sm:px-10 sm:py-28">
        <div className="flex flex-col gap-3.5">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            HOW IT WORKS FOR YOU
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            From her first question to four months on
          </h2>
        </div>

        <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-6">
          <span
            aria-hidden
            className="absolute left-0 right-0 top-5 hidden border-t-[1.5px] border-dashed border-[#F7A267] xl:block"
          />
          {STEPS.map((step) => (
            <li key={step.n} className="relative flex flex-col gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-coral bg-cream text-base font-bold text-[#C9562F]">
                {step.n}
              </span>
              <h3 className="mt-1.5 text-[17px] font-bold">{step.title}</h3>
              <p className="text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#FFF3E2]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 py-24 sm:px-10 sm:py-28 xl:flex-row xl:items-center xl:gap-20">
          <div className="flex flex-col gap-5 xl:flex-[999_1_440px]">
            <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
              BEFORE SHE SAYS HELLO
            </span>
            <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
              See how her symptoms change over time
            </h2>
            <p className="text-[16px] leading-relaxed sm:text-lg sm:leading-[1.7]">
              Before you meet, you get one private summary. Before the follow-up
              she answers again, so you both see what improved.
            </p>
            <ul className="flex list-none flex-col p-0">
              {SUMMARY_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3.5 border-b border-[#EBD3BC] py-3.5 text-[15px] sm:text-base"
                >
                  <svg aria-hidden viewBox="0 0 12 12" className="h-4 w-4 flex-shrink-0">
                    <path
                      d="M2 6.5l2.5 2.5L10 3"
                      stroke="#C9562F"
                      strokeWidth="1.6"
                      fill="none"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs text-brown-muted">
              The MenoScore is Mandi&apos;s own composite and is not validated.
            </p>
          </div>

          <div className="flex w-full justify-center xl:flex-1">
            <figure
              aria-label="Example of the summary a Mandi doctor receives"
              className="flex w-full max-w-[470px] flex-col gap-4 rounded-[18px] bg-white p-6 shadow-[0_30px_60px_rgba(140,60,30,0.14)] sm:p-[30px]"
            >
              <div className="flex items-center justify-between gap-3">
                <Image
                  src="/brand/mandi-v4-logo.png"
                  alt="Mandi"
                  width={52}
                  height={23}
                  className="h-auto w-[52px]"
                />
                <span className="text-[10px] font-bold tracking-[0.18em] text-terra">
                  PATIENT SUMMARY · EXAMPLE
                </span>
              </div>

              <div className="flex items-end justify-between gap-3 border-b border-[#F1DEC9] pb-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-bold">Woman, 49</span>
                  <span className="text-[13px] text-brown-muted">
                    Afrikaans · first appointment 5 Jan
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-brown-muted">MenoScore</span>
                  <span className="text-[30px] font-light text-[#C9562F]">64</span>
                  <span className="text-[15px] text-brown-muted">→ 48</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-bold tracking-[0.14em] text-brown-muted">
                  <span>HARDEST AREAS</span>
                  <span className="flex gap-6">
                    <span>First visit</span>
                    <span>Six weeks</span>
                  </span>
                </div>
                {[
                  { label: "Sleep", first: 83, later: 52 },
                  { label: "Mood", first: 72, later: 44 },
                  { label: "Memory, focus", first: 67, later: 38 },
                ].map((area) => (
                  <div key={area.label} className="grid grid-cols-[88px_1fr] items-center gap-2">
                    <span className="text-xs font-semibold">{area.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-blush">
                        <div
                          className="h-2 rounded-full bg-coral"
                          style={{ width: `${area.first}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-semibold text-brown-muted">
                        {area.first}%
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#FFF3E2]">
                        <div
                          className="h-2 rounded-full bg-sun"
                          style={{ width: `${area.later}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-semibold text-brown-muted">
                        {area.later}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2.5 border-t border-[#F1DEC9] pt-3.5 text-[11px] leading-relaxed">
                <div>
                  <span className="block text-[9px] font-bold tracking-[0.14em] text-brown-muted">
                    ANSWERED &ldquo;EXTREMELY&rdquo;
                  </span>
                  Night sweats · waking at 3am · anxiety · losing words
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-[0.14em] text-brown-muted">
                    FLAGS
                  </span>
                  No safety flag · no specialist flag
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-[0.14em] text-brown-muted">
                    HISTORY
                  </span>
                  Periods irregular · no HRT before · mother&apos;s menopause at 48
                </div>
                <div>
                  <span className="block text-[9px] font-bold tracking-[0.14em] text-brown-muted">
                    FAMILY HISTORY
                  </span>
                  No breast cancer, clots or stroke
                </div>
              </div>

              <div className="border-t border-[#F1DEC9] pt-3.5">
                <span className="text-[9px] font-bold tracking-[0.14em] text-brown-muted">
                  SYMPTOM DIARY · LAST 30 DAYS
                </span>
                <div className="mt-2 flex h-16 items-end gap-1">
                  {DIARY.map((bar, index) => (
                    <span
                      key={index}
                      className="flex-1 rounded-sm"
                      style={{ height: `${bar.height}%`, background: bar.color }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-brown-muted">
                All 56 answers follow on the next page.
              </p>
            </figure>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-5 py-24 sm:px-10 sm:py-28 lg:grid-cols-2 lg:gap-0">
        <div className="flex flex-col gap-6 lg:pr-14">
          <h2 className="font-display text-[28px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
            What you get
          </h2>
          <ul className="flex list-none flex-col p-0">
            {GET.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3.5 border-t border-[#EBD3BC] py-3.5 text-[15px] leading-relaxed sm:text-base"
              >
                <span
                  aria-hidden
                  className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[linear-gradient(135deg,#FFD66B,#F47B4C)]"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-6 border-t border-[#EBD3BC] pt-12 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
          <h2 className="font-display text-[28px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
            What we ask of you
          </h2>
          <ul className="flex list-none flex-col p-0">
            {ASK.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3.5 border-t border-[#EBD3BC] py-3.5 text-[15px] leading-relaxed sm:text-base"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full border-[1.5px] border-coral"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-brown text-[#FFF5E6]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-5 py-24 sm:px-10 sm:py-28">
          <blockquote className="flex max-w-[900px] flex-col gap-4">
            <p className="text-[26px] font-light leading-snug tracking-[-0.01em] sm:text-[36px] sm:leading-[1.35]">
              &ldquo;The Mandi Doctor is the one who listens. She explains, and
              you decide together.&rdquo;
            </p>
            <span className="text-[13px] tracking-[0.04em] text-[#E9CDB4]">
              From &ldquo;Who is the Mandi Doctor?&rdquo;
            </span>
          </blockquote>

          <ol className="grid gap-6 border-t border-sun/35 pt-6 sm:grid-cols-3 sm:gap-0 sm:pt-0">
            {TIMELINE.map((item, index) => (
              <li
                key={item.when}
                className={`flex flex-col gap-2 ${
                  index > 0 ? "sm:border-l sm:border-sun/20 sm:pl-6" : ""
                } ${index < TIMELINE.length - 1 ? "sm:pr-6" : ""} sm:pt-6`}
              >
                <span className="text-[11px] font-bold tracking-[0.2em] text-sun">
                  {item.when}
                </span>
                <span className="text-[15px] leading-relaxed sm:text-[17px]">
                  {item.what}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-24 sm:px-10 sm:py-28 xl:flex-row xl:gap-16">
        <div className="flex flex-col gap-3.5 xl:w-[300px] xl:flex-shrink-0">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            FAQ
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[40px] sm:tracking-[-1px]">
            Questions doctors ask
          </h2>
        </div>
        <div className="flex flex-col border-b border-[#EBD3BC] xl:flex-1">
          {FAQ.map((item) => (
            <div key={item.q} className="border-t border-[#EBD3BC] py-6">
              <h3 className="text-lg font-bold">{item.q}</h3>
              <p className="mt-2.5 max-w-[680px] text-[15px] leading-relaxed sm:text-base sm:leading-[1.7]">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="join" className="bg-mandi-hero">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-24 sm:px-10 sm:py-28 xl:flex-row xl:items-start xl:gap-16">
          <div className="flex flex-col gap-4 xl:flex-[1_1_320px]">
            <span className="text-[11px] font-bold tracking-[0.3em] sm:text-xs">
              APPLY
            </span>
            <h2 className="font-display text-[32px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[44px] sm:tracking-[-1px]">
              Join the Mandi doctor panel
            </h2>
            <p className="text-[16px] leading-relaxed sm:text-lg sm:leading-[1.6]">
              Tell us about you and we&rsquo;ll be in touch within 24 hours.
            </p>
          </div>
          <DoctorApplicationForm />
        </div>
      </section>

      <SiteFooter variant="page" />
    </div>
  );
}
