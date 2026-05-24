"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/ui/Reveal";
import { logEngagement } from "@/server/actions/engagement";

const EVENTS = [
  {
    id: "screening",
    day: "22", month: "AUG", year: "2026",
    time: "18:00", city: "Cape Town", province: "Western Cape",
    lang: "Afrikaans · English",
    format: "inperson",
  },
  {
    id: "askspecialist",
    day: "14", month: "SEP", year: "2026",
    time: "19:30", city: "Online", province: "",
    lang: "English",
    format: "online",
  },
  {
    id: "cafe",
    day: "05", month: "OCT", year: "2026",
    time: "10:00", city: "Woodstock", province: "Western Cape",
    lang: "English · Afrikaans",
    format: "inperson",
  },
  {
    id: "isizulu",
    day: "19", month: "OCT", year: "2026",
    time: "14:00", city: "Durban", province: "KwaZulu-Natal",
    lang: "isiZulu",
    format: "inperson",
  },
];

export default function EventsPage() {
  const { t } = useTranslation("common");

  // Log one event_view per visible event per mount.
  useEffect(() => {
    for (const e of EVENTS) {
      void logEngagement({
        eventType: "event_view",
        targetId: e.id,
        meta: { format: e.format, province: e.province || undefined },
      });
    }
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <Reveal>
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("events.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-5xl sm:text-6xl text-brown leading-[1.05]">
                {t("events.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-brown/75 text-lg mt-5 max-w-xl leading-relaxed">
                {t("events.subhead")}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            {EVENTS.map((e, idx) => (
              <Reveal as="article" key={e.id} delay={Math.min(idx, 6) * 80}>
                <div className="h-full bg-cream-soft rounded-3xl shadow-warm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
                  <div className="flex h-full">
                    {/* Date column */}
                    <div className="bg-brown text-cream px-5 py-6 flex flex-col items-center justify-center min-w-[96px]">
                      <span className="font-display text-4xl leading-none text-golden">{e.day}</span>
                      <span className="text-[11px] uppercase tracking-[0.2em] mt-1 font-semibold">{e.month}</span>
                      <span className="text-[10px] opacity-60 mt-1">{e.year}</span>
                    </div>
                    {/* Body */}
                    <div className="flex-1 p-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full
                          ${e.format === "online" ? "bg-golden/30 text-brown" : "bg-coral/30 text-terra"}`}>
                          {t(`events.format.${e.format}`)}
                        </span>
                        <span className="text-[10px] bg-brown/5 text-brown/60 px-2.5 py-0.5 rounded-full">
                          {t("events.free")}
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-brown leading-snug">
                        {t(`events.items.${e.id}.title`)}
                      </h3>
                      <p className="text-xs text-brown/55 mt-1 mb-3">
                        {e.time} · {e.city}{e.province && ` · ${e.province}`} · {e.lang}
                      </p>
                      <p className="text-sm text-brown/80 leading-relaxed mb-3">
                        {t(`events.items.${e.id}.description`)}
                      </p>
                      <p className="text-[11px] text-brown/50">
                        {t("events.hostedBy", { host: t(`events.items.${e.id}.host`) })}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <div className="bg-golden/20 border border-golden/40 rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-center gap-8 shadow-warm">
              <div className="flex-1">
                <h3 className="font-display text-2xl text-brown mb-3">{t("events.host.heading")}</h3>
                <p className="text-brown/75 text-sm leading-relaxed">{t("events.host.body")}</p>
              </div>
              <Link
                href="mailto:hermi@mrsking.co.za"
                className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-8 py-4 text-sm hover:bg-terra-dark transition-colors shadow-warm whitespace-nowrap"
              >
                {t("events.host.cta")} →
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="bg-brown py-14 mt-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Reveal variant="fade">
              <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("events.principle.eyebrow")}
              </p>
              <p className="text-cream font-display text-2xl sm:text-3xl">
                {t("events.principle.line")}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
