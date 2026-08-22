"use client";

/**
 * Public /events page.
 *
 * Phase 23: replaced the hardcoded EVENTS array with a live read from the
 * `events` table (joined with `event_translations`). Adds a real Register
 * button wired to `events.registration_url` — fires the existing
 * `event_rsvp_click` engagement event and opens the URL in a new tab.
 * When `registration_url` is missing, the card shows a quiet "Contact the
 * host to register" line instead of a broken button.
 *
 * Empty state when no events are published: "No upcoming Mandi gatherings
 * just yet — check back soon." Admin can publish via /admin/events; they
 * surface here within one page-refresh.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Footer, { CONTACT_EMAIL } from "@/components/Footer";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import Reveal from "@/components/ui/Reveal";
import { logEngagement } from "@/server/actions/engagement";
import { fetchPublicEvents } from "@/server/actions/public-content";
import type { EventWithTranslations } from "@/lib/types/models";

/** Pick the translation row that best matches the current i18n language,
 *  falling back to English, then to whatever was first available. Mirrors
 *  the fallbackLng semantics from src/lib/i18n.ts. */
function translationFor(
  e: EventWithTranslations,
  preferredLang: string,
): { name: string; description: string | null } {
  const trs = e.event_translations ?? [];
  const exact = trs.find((t) => t.language_code === preferredLang);
  const fallback = trs.find((t) => t.language_code === "en") ?? trs[0];
  const row = exact ?? fallback;
  return {
    name: row?.name ?? "(untitled event)",
    description: row?.description ?? null,
  };
}

/** Short month abbreviation for the date-pill column. Locale-aware so
 *  switching language also localises the month abbreviation naturally. */
function formatDatePill(iso: string | null, locale: string) {
  if (!iso) return { day: "—", month: "—", year: "—", time: "" };
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d.toLocaleDateString(locale, { month: "short" }).toUpperCase(),
    year: String(d.getFullYear()),
    time: d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function EventsPage() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language?.slice(0, 2).toLowerCase() ?? "en";

  const [events, setEvents] = useState<EventWithTranslations[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await fetchPublicEvents();
        setEvents(rows);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load events");
      }
    })();
  }, []);

  // Fire one event_view per visible event per mount/load.
  useEffect(() => {
    if (!events) return;
    for (const e of events) {
      void logEngagement({
        eventType: "event_view",
        targetId: e.id,
        meta: {
          format: e.format ?? undefined,
          province: e.province ?? undefined,
        },
      });
    }
  }, [events]);

  // Filter out events whose date is in the past — public surface should
  // not show stale gatherings. Sorted ascending by date already.
  const upcoming = useMemo(() => {
    if (!events) return null;
    const now = Date.now();
    return events.filter((e) => {
      if (!e.date) return true; // dateless events surface conservatively
      return new Date(e.date).getTime() >= now - 1000 * 60 * 60 * 6; // 6h grace
    });
  }, [events]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden bg-mandi-gradient">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/15" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
            <Reveal>
              <p className="text-cream/85 text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("events.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05]">
                {t("events.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-cream/85 text-lg mt-5 max-w-xl leading-relaxed">
                {t("events.subhead")}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-14">
          {error && (
            <p className="text-center py-10 text-terra text-sm">{t("events.loadError")}</p>
          )}
          {!error && upcoming === null && (
            <p className="text-center py-10 text-brown/50 text-sm">
              {t("events.loading")}
            </p>
          )}
          {!error && upcoming && upcoming.length === 0 && (
            <Reveal variant="fade">
              <p className="text-center py-16 text-brown/55 text-base max-w-md mx-auto leading-relaxed">
                {t("events.empty")}
              </p>
            </Reveal>
          )}
          {upcoming && upcoming.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {upcoming.map((e, idx) => {
                const tr = translationFor(e, lang);
                const date = formatDatePill(e.date, i18n.language ?? "en");
                const formatKey = e.format ?? "inperson";
                const cityLine = [
                  date.time || null,
                  e.format === "online" ? t("events.online") : null,
                  e.province ?? null,
                  e.location ?? null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <Reveal as="article" key={e.id} delay={Math.min(idx, 6) * 80}>
                    <div className="h-full bg-cream-soft rounded-3xl shadow-warm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
                      <div className="flex h-full">
                        {/* Date column */}
                        <div className="bg-brown text-cream px-5 py-6 flex flex-col items-center justify-center min-w-[96px]">
                          <span className="font-display text-4xl leading-none text-golden">
                            {date.day}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.2em] mt-1 font-semibold">
                            {date.month}
                          </span>
                          <span className="text-[10px] opacity-60 mt-1">
                            {date.year}
                          </span>
                        </div>
                        {/* Body */}
                        <div className="flex-1 p-5 flex flex-col">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full
                                ${formatKey === "online" ? "bg-golden/30 text-brown" : "bg-coral/30 text-terra"}`}
                            >
                              {t(`events.format.${formatKey}`)}
                            </span>
                            {e.free && (
                              <span className="text-[10px] bg-brown/5 text-brown/60 px-2.5 py-0.5 rounded-full">
                                {t("events.free")}
                              </span>
                            )}
                            {!e.free && e.cost && (
                              <span className="text-[10px] bg-brown/5 text-brown/60 px-2.5 py-0.5 rounded-full">
                                {e.cost}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-lg text-brown leading-snug">
                            {tr.name}
                          </h3>
                          {cityLine && (
                            <p className="text-xs text-brown/55 mt-1">{cityLine}</p>
                          )}
                          {tr.description && (
                            <p className="text-sm text-brown/80 leading-relaxed mt-3 mb-3 flex-1">
                              {tr.description}
                            </p>
                          )}
                          {e.host && (
                            <p className="text-[11px] text-brown/50 mb-3">
                              {t("events.hostedBy", { host: e.host })}
                            </p>
                          )}
                          {/* Register CTA — Phase 23 wires the previously
                              decorative button to registration_url. */}
                          {e.registration_url ? (
                            <a
                              href={e.registration_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                void logEngagement({
                                  eventType: "event_rsvp_click",
                                  targetId: e.id,
                                  meta: { format: e.format ?? undefined },
                                })
                              }
                              className="inline-flex items-center justify-center bg-terra text-cream font-semibold rounded-full px-7 py-3 text-sm hover:bg-terra-dark active:scale-95 transition-all shadow-warm self-start"
                            >
                              {t("events.registerCta")} →
                            </a>
                          ) : (
                            <p className="text-[11px] text-brown/50 italic">
                              {t("events.contactToRegister", {
                                host: e.host ?? t("events.theHost"),
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <Reveal>
            <div className="bg-golden/20 border border-golden/40 rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-center gap-8 shadow-warm">
              <div className="flex-1">
                <h3 className="font-display text-2xl text-brown mb-3">
                  {t("events.host.heading")}
                </h3>
                <p className="text-brown/75 text-sm leading-relaxed">
                  {t("events.host.body")}
                </p>
              </div>
              <div className="flex-shrink-0 text-center">
                <Link
                  href={`mailto:${CONTACT_EMAIL}?subject=An event for Mandi`}
                  className="inline-block bg-terra text-cream font-semibold rounded-full px-8 py-4 text-sm hover:bg-terra-dark transition-colors shadow-warm whitespace-nowrap"
                >
                  {t("events.host.cta")} →
                </Link>
                <p className="mt-2 text-xs text-brown/60">{CONTACT_EMAIL}</p>
              </div>
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
      <Footer />
    </>
  );
}
