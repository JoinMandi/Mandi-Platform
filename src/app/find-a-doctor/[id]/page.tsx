"use client";

/**
 * Phase 23 — per-doctor profile page at /find-a-doctor/[id].
 *
 * Reached by clicking a doctor card on /find-a-doctor. Shows full
 * bio + languages + practice + Book CTA. Mirrors the shape of
 * /admin/users/[id] for visual consistency on the dev side, but
 * styled for the public surface.
 *
 * Engagement: fires a richer `doctor_view` event on mount with the
 * specific doctor id as `target_id` (the list-page also fires
 * `doctor_view` per card but the detail-page event signals stronger
 * interest).
 */

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import Reveal from "@/components/ui/Reveal";
import { logEngagement } from "@/server/actions/engagement";
import { fetchDoctorProfile } from "@/server/actions/public-content";
import type { DoctorRow } from "@/lib/types/database";

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation("common");
  const [doctor, setDoctor] = useState<DoctorRow | null | undefined>(undefined);

  useEffect(() => {
    void (async () => {
      const d = await fetchDoctorProfile(id);
      setDoctor(d);
      if (d) {
        void logEngagement({ eventType: "doctor_view", targetId: d.id });
      }
    })();
  }, [id]);

  // undefined = still loading; null = looked up, not found
  if (doctor === undefined) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-brown/50 text-sm">{t("doctor.loading")}</p>
        </main>
      </>
    );
  }

  if (doctor === null) {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-cream flex items-center justify-center px-6">
          <div className="bg-cream-soft rounded-3xl shadow-warm-xl p-8 max-w-md text-center">
            <p className="font-display text-2xl text-brown mb-3">
              {t("doctor.profile.notFoundTitle")}
            </p>
            <p className="text-brown/65 text-sm mb-5">
              {t("doctor.profile.notFoundBody")}
            </p>
            <Link href="/find-a-doctor" className="link-warm text-terra">
              ← {t("doctor.profile.backToList")}
            </Link>
          </div>
        </main>
      </>
    );
  }

  const firstName =
    doctor.name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/)[0] ?? doctor.name;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Gradient hero band — the profile used to be cream-on-cream only */}
        <div className="relative overflow-hidden bg-mandi-gradient pb-10">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/15" />
          <section className="relative z-10 max-w-3xl mx-auto px-6 pt-8">
            <Link
              href="/find-a-doctor"
              className="text-cream text-sm font-semibold inline-flex items-center gap-1 mb-6 hover:gap-2 transition-all"
            >
              ← {t("doctor.profile.backToList")}
            </Link>
          </section>

        {/* Hero card */}
        <section className="relative z-10 max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="bg-cream-soft rounded-3xl shadow-warm p-8 sm:p-10 border-l-4 border-terra">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {doctor.photo_url ? (
                  <Image
                    src={doctor.photo_url}
                    alt={doctor.name}
                    width={120}
                    height={120}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-warm ring-4 ring-cream"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-golden via-pink-mandi to-terra shadow-warm ring-4 ring-cream flex items-center justify-center">
                    <span className="font-display text-3xl sm:text-4xl text-cream drop-shadow">
                      {initials(doctor.name)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-1">
                    {t("doctor.profile.eyebrow")}
                  </p>
                  <h1 className="font-display text-3xl sm:text-4xl text-brown leading-tight">
                    {doctor.name}
                  </h1>
                  {doctor.practice && (
                    <p className="text-terra text-base font-semibold mt-1">
                      {doctor.practice}
                    </p>
                  )}
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {(doctor.languages ?? []).map((l) => (
                      <span
                        key={l}
                        className="text-[11px] bg-golden/25 text-brown px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <section className="max-w-3xl mx-auto px-6 mb-8">
            <Reveal delay={80}>
              <div className="bg-cream-soft rounded-3xl shadow-warm p-7 sm:p-9">
                <h2 className="font-display text-2xl text-brown mb-3">
                  {t("doctor.profile.aboutHeading")}
                </h2>
                <p className="text-brown/85 text-base leading-relaxed whitespace-pre-line">
                  {doctor.bio}
                </p>
              </div>
            </Reveal>
          </section>
        )}

        {/* Book CTA */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <Reveal delay={160}>
            <div className="bg-golden/20 border border-golden/40 rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-center gap-6 shadow-warm">
              <div className="flex-1">
                <h3 className="font-display text-2xl text-brown mb-2">
                  {doctor.booking_url
                    ? t("doctor.profile.bookHeading", { name: firstName })
                    : t("doctor.profile.contactHeading")}
                </h3>
                <p className="text-brown/75 text-sm leading-relaxed">
                  {doctor.booking_url
                    ? t("doctor.profile.bookBody")
                    : t("doctor.profile.contactBody")}
                </p>
              </div>
              {doctor.booking_url ? (
                <a
                  href={doctor.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    void logEngagement({
                      eventType: "doctor_book_click",
                      targetId: doctor.id,
                    })
                  }
                  className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-8 py-4 text-sm hover:bg-terra-dark transition-colors shadow-warm whitespace-nowrap"
                >
                  {t("doctor.profile.bookCta")} →
                </a>
              ) : (
                <Link
                  href="/find-a-doctor"
                  className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-8 py-4 text-sm hover:bg-terra-dark transition-colors shadow-warm whitespace-nowrap"
                >
                  {t("doctor.profile.backToList")} →
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      </main>
    </>
  );
}
