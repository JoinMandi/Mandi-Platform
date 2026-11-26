import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy notice — Mandi",
  description:
    "How JoinMandi handles your personal and health information, in line with POPIA.",
};

const SECTIONS = [
  {
    title: "Who we are",
    body: (
      <>
        Mandi is run by JOINMANDI (PTY) LTD, registration 2026/805791/07, South
        Africa. For any privacy question, or to ask for a copy of your
        information, email{" "}
        <a href="mailto:hello@joinmandi.com" className="underline">
          hello@joinmandi.com
        </a>
        .
      </>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        Your answers to the 56-question check-in, your MenoScore and the areas it
        identifies. If you choose to save your journey, we keep those answers so
        you can return. If you book or ask to meet a doctor, we collect the
        contact details you give us. If you apply to join the doctor panel, we
        collect your professional details. We also keep basic technical logs to
        run and protect the service. Health information is special personal
        information under POPIA, and we treat it that way.
      </>
    ),
  },
  {
    title: "Why we use it",
    body: (
      <>
        To give you your results, blanket and doctor summary; to save your
        progress and let you continue on another device; to connect you with a
        Mandi doctor only when you ask us to; to improve the service and keep it
        secure; and to meet our legal obligations. With your consent, we also use
        de-identified answers to build a South African picture of women&apos;s
        hormone health.
      </>
    ),
  },
  {
    title: "Your choices",
    body: (
      <>
        Taking the check-in is your choice. Your answers are not shared with a
        doctor unless you choose to share them. Research uses de-identified
        information and is kept separate from your care. We never sell your
        information and we do not use it for targeted advertising. You can
        withdraw consent or ask us to delete your information at any time.
      </>
    ),
  },
  {
    title: "Where it is kept",
    body: (
      <>
        Personal information is stored in South Africa, on encrypted
        infrastructure in the Cape Town region. Access is limited to the small
        Mandi team that needs it to run the service, and to a doctor only when
        you choose to share your summary.
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <>
        We keep your account and answers until you ask us to delete them. When
        you ask for deletion, we remove your personal and health information and
        record the deletion in our audit log. De-identified research data may be
        kept for research, because it no longer identifies you. Backups expire on
        a rolling basis.
      </>
    ),
  },
  {
    title: "Who can see it",
    body: (
      <>
        You; the small Mandi team that supports the service; a doctor you choose
        to share your summary with; and service providers who host or support the
        platform under contract. We may also disclose information where the law
        requires it.
      </>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        Under POPIA you may ask to see the personal information we hold about
        you, ask us to correct it, ask us to delete it, object to certain uses,
        or withdraw consent. Email{" "}
        <a href="mailto:hello@joinmandi.com" className="underline">
          hello@joinmandi.com
        </a>
        . You may also complain to the Information Regulator of South Africa.
      </>
    ),
  },
  {
    title: "Age",
    body: <>Mandi is for people aged 18 and older. We do not knowingly collect information from anyone under 18.</>,
  },
  {
    title: "Changes",
    body: (
      <>
        If this notice changes, we will update the date below. The current notice
        applies from 26 November 2026.
      </>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream font-sans text-brown">
      <div className="bg-mandi-hero">
        <SiteHeader
          variant="page"
          cta={{ href: "/v4/language", label: "Get my MenoScore" }}
        />
        <section className="mx-auto max-w-[900px] px-5 pb-20 pt-8 sm:px-10 sm:pb-24 sm:pt-12">
          <span className="text-[11px] font-bold tracking-[0.3em] sm:text-xs">
            YOUR INFORMATION
          </span>
          <h1 className="mt-4 font-display text-[38px] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-[54px]">
            Privacy notice
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed sm:text-lg">
            What we collect, why we collect it, where it is kept, and the choices
            you have. This notice covers the Mandi website and the 56-question
            check-in.
          </p>
        </section>
      </div>

      <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-10 sm:py-20">
        <div className="flex flex-col gap-10">
          {SECTIONS.map((section, index) => (
            <section key={section.title} className="border-t border-cream-deep pt-8">
              <div className="flex gap-4">
                <span className="font-display text-lg font-extrabold text-terra">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-xl font-extrabold sm:text-2xl">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-brown-soft sm:text-base sm:leading-[1.7]">
                    {section.body}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-white p-6 shadow-warm sm:p-8">
          <p className="text-sm leading-relaxed text-brown-soft">
            Mandi is not an emergency service. If you are in danger, call 112.
            For mental health support, SADAG is available on 0800 567 567.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-brown-soft">
            Questions about this notice?{" "}
            <a href="mailto:hello@joinmandi.com" className="font-semibold underline">
              hello@joinmandi.com
            </a>
            . You can also{" "}
            <Link href="/consent" className="font-semibold underline">
              read the consent choices
            </Link>{" "}
            before starting the check-in.
          </p>
        </div>
      </main>

      <SiteFooter variant="page" />
    </div>
  );
}
