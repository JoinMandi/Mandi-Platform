"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import AnimatedBlanket from "@/components/site/AnimatedBlanket";
import SiteFooter from "@/components/site/SiteFooter";
import SiteHeader from "@/components/site/SiteHeader";

const GREETINGS = [
  { lead: "Talk to", brand: "Mandi" },
  { lead: "Khuluma", brand: "noMandi" },
  { lead: "Thetha", brand: "noMandi" },
  { lead: "Praat met", brand: "Mandi" },
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

const BARS = [
  { key: "home.exampleSleep", value: 83 },
  { key: "home.exampleMood", value: 72 },
  { key: "home.exampleMemory", value: 67 },
] as const;

const FREE = [1, 2, 3, 4] as const;
const MEMBER = [1, 2, 3, 4] as const;

function StepIcon({ step }: { step: number }) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#2C1810",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-9 w-9 sm:h-[38px] sm:w-[38px]",
  };
  if (step === 1) {
    return (
      <svg {...common}>
        <path d="M4 5h16v10H9l-5 4z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    );
  }
  if (step === 2) {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
        <path d="M8 11h6M11 8v6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export default function HomePage() {
  const { t } = useTranslation("common");
  const [greeting, setGreeting] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setGreeting((current) => (current + 1) % GREETINGS.length),
      2600,
    );
    return () => window.clearInterval(id);
  }, []);

  const phrase = GREETINGS[greeting];

  return (
    <div className="min-h-screen overflow-x-clip bg-cream font-sans text-brown">
      <div className="relative overflow-clip bg-mandi-hero">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-60 -top-[380px] h-[820px] w-[820px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_70%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[300px] -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_70%)]"
        />

        <SiteHeader />

        <section className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-5 pb-28 pt-10 sm:px-10 sm:pb-32 sm:pt-12 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:gap-[72px]">
          <div className="flex w-full min-w-0 flex-col gap-[22px] min-[1100px]:flex-[999_1_540px]">
            <span className="inline-flex items-center gap-2.5 self-start rounded-full bg-[#FFF5DA] py-2.5 pl-3 pr-4 text-[10px] font-bold tracking-[0.2em] sm:text-xs sm:tracking-[0.22em]">
              <span className="h-2.5 w-2.5 rounded-full bg-coral shadow-[0_0_0_4px_rgba(244,123,76,0.25)]" />
              {t("home.eyebrow")}
            </span>

            <h1
              aria-label={`${t("home.titleLead")} ${t("home.titleBrand")}`}
              className="min-h-[1.05em] font-display text-[44px] font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[86px]"
            >
              <span key={greeting} aria-hidden className="inline-block animate-rise-in">
                {phrase.lead}{" "}
                <span className="bg-[linear-gradient(180deg,transparent_62%,rgba(255,251,243,0.75)_62%)] px-1.5">
                  {phrase.brand}
                </span>
              </span>
            </h1>

            <p className="max-w-[540px] text-lg font-semibold leading-snug sm:text-2xl sm:leading-[1.4]">
              {t("home.sub")}
            </p>

            <p className="max-w-[520px] text-[15px] leading-relaxed sm:text-[17px] sm:leading-[1.65]">
              {t("home.bodyLead")}
              <b className="font-bold">{t("home.bodyStrong")}</b>
              {t("home.bodyTail")}
            </p>

            <p className="text-[11px] font-semibold tracking-[0.08em] opacity-85 sm:text-[13px] sm:tracking-[0.06em]">
              {t("home.seen")}
            </p>

            <div className="mt-2.5 grid gap-4 sm:grid-cols-2">
              <Link
                href="/v4/language"
                className="flex flex-col gap-2 rounded-3xl bg-cream p-5 text-brown no-underline shadow-[0_18px_40px_rgba(140,60,30,0.2)] transition-transform hover:-translate-y-0.5 sm:p-[26px]"
              >
                <span className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.22em] text-terra sm:text-[11px]">
                    {t("home.womenLabel")}
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B8431F"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
                  </svg>
                </span>
                <span className="text-xl font-extrabold leading-tight sm:text-[22px]">
                  {t("home.womenTitle")}
                </span>
                <span className="text-sm leading-normal sm:text-[15px]">
                  {t("home.womenBody")}
                </span>
                <span className="mt-1.5 self-start rounded-full border-2 border-dashed border-[#F7A267] bg-[#FFF0D2] px-4 py-2 text-xs font-bold sm:text-sm">
                  {t("home.womenCta")}
                </span>
              </Link>

              <Link
                href="/doctors"
                className="flex flex-col gap-2 rounded-3xl bg-brown-warm p-5 text-[#FFF5E6] no-underline shadow-[0_18px_40px_rgba(103,60,51,0.35)] transition-transform hover:-translate-y-0.5 sm:p-[26px]"
              >
                <span className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.22em] text-sun sm:text-[11px]">
                    {t("home.doctorsLabel")}
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFD66B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
                    <path d="M10 13v3a5 5 0 0 0 10 0v-2" />
                    <circle cx="20" cy="12" r="2" />
                  </svg>
                </span>
                <span className="text-xl font-extrabold leading-tight sm:text-[22px]">
                  {t("home.doctorsTitle")}
                </span>
                <span className="text-sm leading-normal text-peach sm:text-[15px]">
                  {t("home.doctorsBody")}
                </span>
                <span className="mt-1.5 self-start rounded-full bg-sun px-4 py-2 text-xs font-bold text-brown sm:text-sm">
                  {t("home.doctorsCta")}
                </span>
              </Link>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-[18px] min-[1100px]:max-w-[440px] min-[1100px]:flex-[1_1_400px]">
            <div className="animate-floaty flex flex-col gap-4 rounded-[26px] bg-cream p-5 shadow-[0_22px_48px_rgba(140,60,30,0.22)] motion-reduce:animate-none sm:p-[26px]">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-[74px] w-[74px] flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#F47B4C 0 64%, #FBE3CC 64% 100%)",
                  }}
                >
                  <span className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-cream text-xl font-extrabold">
                    64
                  </span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold tracking-[0.14em] text-terra sm:text-[11px]">
                    {t("home.exampleLabel")}
                  </span>
                  <span className="text-lg font-extrabold leading-tight sm:text-[19px]">
                    {t("home.exampleTitle")}
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {BARS.map((bar) => (
                  <div key={bar.key}>
                    <div className="flex justify-between text-[13px] font-bold">
                      <span>{t(bar.key)}</span>
                      <span>{bar.value}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-blush">
                      <div
                        className="h-2.5 rounded-full bg-[linear-gradient(90deg,#FFC94F,#F47B4C)]"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-floaty ml-auto flex items-center gap-3.5 rounded-[22px] bg-brown-warm px-5 py-4 text-[#FFF5E6] shadow-[0_16px_34px_rgba(103,60,51,0.35)] [animation-delay:1.2s] motion-reduce:animate-none">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFD66B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="flex flex-col">
                <span className="text-[10px] font-extrabold tracking-[0.14em] text-sun">
                  {t("home.exampleNextLabel")}
                </span>
                <span className="text-sm font-bold sm:text-[15px]">
                  {t("home.exampleNext")}
                </span>
              </span>
            </div>

            <p className="text-right text-xs font-semibold opacity-80">
              {t("home.exampleCaption")}
            </p>
          </div>
        </section>
      </div>

      <section
        aria-label="Mandi in numbers"
        className="relative mx-auto -mt-[60px] max-w-[1200px] px-5 sm:px-10"
      >
        <div className="grid grid-cols-3 rounded-[28px] bg-white px-2 py-6 shadow-[0_18px_44px_rgba(140,60,30,0.12)] sm:px-3 sm:py-[30px]">
          {[
            { value: "56", label: "home.statsQuestions" },
            { value: "4", label: "home.statsLanguages" },
            { value: "R0", label: "home.statsFree" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center gap-1 px-2 text-center ${
                index < 2 ? "border-r border-cream-deep" : ""
              }`}
            >
              <span className="text-[32px] font-extrabold text-coral sm:text-[40px]">
                {stat.value}
              </span>
              <span className="text-[11px] font-semibold leading-tight sm:text-sm">
                {t(stat.label)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="women"
        className="mx-auto flex max-w-[1200px] flex-col gap-12 px-5 pb-16 pt-20 sm:gap-14 sm:px-10 sm:pb-20 sm:pt-28"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            {t("home.howEyebrow")}
          </span>
          <h2 className="max-w-3xl font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[46px] sm:tracking-[-1.2px]">
            {t("home.howTitle")}
          </h2>
          <p className="max-w-[740px] text-[15px] leading-relaxed sm:text-lg sm:leading-[1.65]">
            {t("home.howBody")}
          </p>
        </div>

        <ol className="relative grid gap-9 sm:grid-cols-3 sm:gap-8">
          <span
            aria-hidden
            className="absolute left-[16%] right-[16%] top-11 hidden border-t-[3px] border-dashed border-[#F7A267] sm:block"
          />
          {[1, 2, 3].map((step) => (
            <li
              key={step}
              className="relative flex flex-col items-center gap-3 px-3 text-center"
            >
              <span
                className={`flex h-[76px] w-[76px] items-center justify-center rounded-[24px] shadow-[0_12px_26px_rgba(244,123,76,0.32)] sm:h-[88px] sm:w-[88px] sm:rounded-[28px] ${
                  step === 1
                    ? "bg-[linear-gradient(135deg,#FFD66B,#FFAA4F)]"
                    : step === 2
                      ? "bg-[linear-gradient(135deg,#FFAA4F,#F7894F)]"
                      : "bg-[linear-gradient(135deg,#F7894F,#E2633F)]"
                }`}
              >
                <StepIcon step={step} />
              </span>
              <h3 className="mt-2 text-lg font-extrabold sm:text-[21px]">
                {t(`home.step${step}Title`)}
              </h3>
              <p className="text-[15px] leading-normal sm:text-base sm:leading-[1.55]">
                {t(`home.step${step}Body`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[linear-gradient(135deg,#FFF1CF_0%,#FFE3D1_100%)]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-5 py-20 sm:px-10 sm:py-24">
          <div className="flex min-w-0 flex-1 basis-[320px] justify-center">
            <AnimatedBlanket />
          </div>
          <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-[18px]">
            <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
              {t("home.blanketEyebrow")}
            </span>
            <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[44px] sm:tracking-[-1px]">
              {t("home.blanketTitle")}
            </h2>
            <p className="text-[15px] leading-relaxed sm:text-lg sm:leading-[1.7]">
              {t("home.blanketBody1")}
            </p>
            <p className="text-[15px] leading-relaxed sm:text-lg sm:leading-[1.7]">
              {t("home.blanketBody2")}
            </p>
            <p className="text-[15px] leading-relaxed sm:text-lg sm:leading-[1.7]">
              {t("home.blanketBody3")}
            </p>
          </div>
        </div>
      </section>

      <div
        aria-hidden
        className="mx-auto grid max-w-[1200px] gap-1.5 px-5 pt-16 sm:px-10 sm:pt-20"
        style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
      >
        {STRIP.map((background, index) => (
          <span key={index} className="h-5 rounded-md" style={{ background }} />
        ))}
      </div>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-11 px-5 pb-24 pt-16 sm:px-10 sm:pt-24">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[11px] font-bold tracking-[0.3em] text-terra sm:text-xs">
            {t("home.offerEyebrow")}
          </span>
          <h2 className="font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[44px] sm:tracking-[-1px]">
            {t("home.offerTitle")}
          </h2>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-0">
          <div className="flex flex-col gap-[22px] lg:pr-16">
            <span
              aria-hidden
              className="h-1 rounded-full bg-[linear-gradient(90deg,#FFD66B,#FFAA4F,#F47B4C)]"
            />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[11px] font-extrabold tracking-[0.16em] text-terra sm:text-[13px] sm:tracking-[0.14em]">
                {t("home.offerFreeLabel")}
              </span>
              <span className="bg-gradient-to-br from-flame to-[#E2633F] bg-clip-text text-[44px] font-extrabold leading-none tracking-[-0.03em] text-transparent sm:text-[56px]">
                {t("home.offerFreePrice")}
              </span>
            </div>
            <ul className="flex list-none flex-col p-0">
              {FREE.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 border-t border-cream-deep py-[18px]"
                >
                  <span
                    aria-hidden
                    className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFD66B,#F47B4C)]"
                  >
                    <svg viewBox="0 0 12 12" className="h-3 w-3">
                      <path
                        d="M2 6.5l2.5 2.5L10 3"
                        stroke="#2C1810"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-base font-bold sm:text-lg">
                      {t(`home.offerFree${item}Title`)}
                    </span>
                    <span className="text-sm leading-relaxed text-brown-soft sm:text-[15px] sm:leading-[1.55]">
                      {t(`home.offerFree${item}Body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[22px] border-t border-cream-deep pt-10 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <span aria-hidden className="h-1 rounded-full bg-cream-deep" />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[11px] font-extrabold tracking-[0.16em] text-brown-muted sm:text-[13px] sm:tracking-[0.14em]">
                {t("home.offerMemberLabel")}
              </span>
              <span className="text-sm font-semibold text-brown-muted sm:text-[15px]">
                {t("home.offerMemberPrice")}
              </span>
            </div>
            <ul className="flex list-none flex-col p-0">
              {MEMBER.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 border-t border-cream-deep py-[18px]"
                >
                  <span
                    aria-hidden
                    className="h-[26px] w-[26px] flex-shrink-0 rounded-full border-2 border-[#F7A267]"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="text-[17px] font-bold">
                      {t(`home.offerMember${item}Title`)}
                    </span>
                    <span className="text-sm leading-relaxed text-brown-muted sm:text-[15px] sm:leading-[1.55]">
                      {t(`home.offerMember${item}Body`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-cream-deep pt-[18px] text-[13px] leading-relaxed text-brown-muted">
              {t("home.offerMemberNote")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-14 sm:px-10">
        <div className="relative grid gap-8 overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#673C33_0%,#8A4A35_100%)] p-7 text-[#FFF5E6] sm:p-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[120px] -top-[200px] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(255,214,107,0.35)_0%,rgba(255,214,107,0)_70%)]"
          />
          <div className="relative flex min-w-0 flex-col gap-4">
            <span className="text-[11px] font-bold tracking-[0.3em] text-sun sm:text-xs">
              {t("home.panelEyebrow")}
            </span>
            <h2 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#FFF5E6] sm:text-[40px] sm:tracking-[-1px]">
              {t("home.panelTitle")}
            </h2>
            <p className="max-w-2xl text-[15px] leading-relaxed text-peach sm:text-lg sm:leading-[1.6]">
              {t("home.panelBody")}
            </p>
          </div>
          <Link
            href="/doctors"
            className="relative inline-flex justify-self-start rounded-full bg-[linear-gradient(90deg,#FFD66B,#F2C14E)] px-7 py-[17px] text-sm font-extrabold text-brown no-underline shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5 sm:text-base lg:justify-self-end"
          >
            {t("home.panelCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-10">
        <div className="relative grid gap-7 overflow-hidden rounded-[32px] bg-mandi-hero p-7 sm:p-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-[200px] -left-20 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.5)_0%,rgba(255,255,255,0)_70%)]"
          />
          <div className="relative flex min-w-0 flex-col gap-2.5">
            <h2 className="font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[42px] sm:tracking-[-1px]">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-[15px] font-semibold leading-relaxed sm:text-[17px] sm:leading-[1.55]">
              {t("home.ctaBody")}
            </p>
            <p className="text-xs sm:text-[13px]">{t("home.ctaNote")}</p>
          </div>
          <Link
            href="/v4/language"
            className="relative inline-flex justify-self-start rounded-full border-2 border-dashed border-brown-warm bg-[#FFF0D2] px-7 py-3.5 text-sm font-extrabold text-brown no-underline transition-transform hover:-translate-y-0.5 sm:text-base lg:justify-self-end"
          >
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
