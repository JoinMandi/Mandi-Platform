"use client";

/**
 * Public /find-a-doctor page.
 *
 * Phase 23: replaced the hardcoded CLINICS + DOCTORS arrays with a live
 * read from `clinic_directory` + `doctor_profiles`. Book consult buttons
 * now actually navigate — they open `booking_url` in a new tab when set,
 * else show a fallback "Contact below" line backed by the clinic's
 * `contact` field. Doctor cards link to `/find-a-doctor/[id]` for the
 * full profile.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import AmbientBlobs from "@/components/ui/AmbientBlobs";
import Reveal from "@/components/ui/Reveal";
import { logEngagement } from "@/server/actions/engagement";
import { fetchFindADoctor } from "@/server/actions/public-content";
import type { ClinicRow, DoctorRow, ClinicFormat } from "@/lib/types/database";

const PROVINCE_OPTIONS = [
  "All",
  "Western Cape",
  "Gauteng",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];
const LANGUAGE_OPTIONS = ["All", "English", "Afrikaans", "isiZulu", "isiXhosa"];
const FORMAT_OPTIONS: ("All" | ClinicFormat)[] = ["All", "inperson", "online", "both"];

const FORMAT_LABEL_KEY: Record<string, string> = {
  All: "doctor.filter.all",
  inperson: "doctor.filter.inperson",
  online: "doctor.filter.online",
  both: "doctor.filter.both",
};

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function FindADoctorPage() {
  const { t } = useTranslation("common");
  const [clinics, setClinics] = useState<ClinicRow[] | null>(null);
  const [doctors, setDoctors] = useState<DoctorRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [province, setProvince] = useState<string>("All");
  const [language, setLanguage] = useState<string>("All");
  const [format, setFormat] = useState<"All" | ClinicFormat>("All");

  useEffect(() => {
    void (async () => {
      try {
        const { clinics: cs, doctors: ds } = await fetchFindADoctor();
        setClinics(cs);
        setDoctors(ds);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  const filteredClinics = useMemo(() => {
    if (!clinics) return null;
    return clinics.filter((c) => {
      const pOk = province === "All" || c.province === province;
      const lOk = language === "All" || (c.languages ?? []).includes(language);
      const fOk =
        format === "All" ||
        c.format === format ||
        // "both" matches any in-person OR online filter; conversely a
        // clinic that's "both" should also match either filter
        c.format === "both" ||
        format === "both";
      return pOk && lOk && fOk;
    });
  }, [clinics, province, language, format]);

  // Engagement event per visible clinic on every filter change.
  useEffect(() => {
    if (!filteredClinics) return;
    for (const c of filteredClinics) {
      void logEngagement({
        eventType: "doctor_view",
        targetId: c.id,
        meta: {
          province: c.province ?? undefined,
          format: c.format ?? undefined,
        },
      });
    }
  }, [filteredClinics]);

  useEffect(() => {
    if (!doctors) return;
    for (const d of doctors) {
      void logEngagement({ eventType: "doctor_view", targetId: d.id });
    }
  }, [doctors]);

  const filterLabel = (v: string) =>
    FORMAT_LABEL_KEY[v] ? t(FORMAT_LABEL_KEY[v]) : v;

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/15" />
          <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
            <Reveal>
              <p className="text-cream/85 text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("doctor.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-5xl sm:text-6xl text-cream leading-[1.05] max-w-2xl">
                {t("doctor.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-cream/85 text-base mt-5 max-w-xl">
                {t("doctor.subhead")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Filter pills */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <Reveal>
            <FilterRow
              label={t("doctor.filter.province")}
              items={PROVINCE_OPTIONS}
              value={province}
              onChange={setProvince}
              labelFor={filterLabel}
            />
            <FilterRow
              label={t("doctor.filter.language")}
              items={LANGUAGE_OPTIONS}
              value={language}
              onChange={setLanguage}
              labelFor={filterLabel}
            />
            <FilterRow
              label={t("doctor.filter.format")}
              items={FORMAT_OPTIONS as readonly string[]}
              value={format}
              onChange={(v) => setFormat(v as "All" | ClinicFormat)}
              labelFor={filterLabel}
            />
          </Reveal>
        </section>

        {/* Clinic directory */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          {error && (
            <p className="text-center py-10 text-terra text-sm">{t("doctor.loadError")}</p>
          )}
          {!error && filteredClinics === null && (
            <p className="text-center py-10 text-brown/50 text-sm">
              {t("doctor.loading")}
            </p>
          )}
          {filteredClinics && filteredClinics.length === 0 && (
            <Reveal variant="fade">
              <p className="text-center py-16 text-brown/50 text-sm">
                {t("doctor.empty")}
              </p>
            </Reveal>
          )}
          {filteredClinics && filteredClinics.length > 0 && (
            <div className="grid gap-4">
              {filteredClinics.map((c, i) => (
                <ClinicCard key={c.id} clinic={c} index={i} filterLabel={filterLabel} />
              ))}
            </div>
          )}
        </section>

        {/* Meet the Doctors */}
        <section className="bg-cream-deep/30 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Reveal>
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-2 text-center">
                {t("doctor.meetEyebrow")}
              </p>
              <h2 className="font-display text-3xl text-brown text-center mb-10">
                {t("doctor.meetTitle")}
              </h2>
            </Reveal>
            {doctors === null && !error && (
              <p className="text-center text-brown/50 text-sm">
                {t("doctor.loading")}
              </p>
            )}
            {doctors && doctors.length === 0 && (
              <p className="text-center text-brown/50 text-sm">
                {t("doctor.emptyDoctors")}
              </p>
            )}
            {doctors && doctors.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {doctors.map((d, i) => (
                  <DoctorCard key={d.id} doctor={d} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Closer — the page used to dead-end on the grid */}
        <section className="relative overflow-hidden bg-mandi-gradient-dusk py-16">
          <AmbientBlobs intensity="soft" />
          <div className="pointer-events-none absolute inset-0 bg-brown/25" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <Reveal>
              <h2 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-6">
                {t("hrt.cta.heading")}
              </h2>
              <Link
                href="/consent"
                className="inline-block bg-cream text-terra font-semibold rounded-full px-9 py-4 text-base shadow-warm-xl hover:bg-golden transition-colors"
              >
                {t("hrt.cta.questionnaire")} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function ClinicCard({
  clinic: c,
  index,
  filterLabel,
}: {
  clinic: ClinicRow;
  index: number;
  filterLabel: (v: string) => string;
}) {
  const { t } = useTranslation("common");
  const hasBookingUrl = !!c.booking_url;
  return (
    <Reveal as="article" delay={Math.min(index, 6) * 70}>
      <div className="bg-cream-soft rounded-3xl shadow-warm p-6 flex flex-col sm:flex-row sm:items-center gap-5 border-l-4 border-terra transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-display text-xl text-brown">{c.name}</h3>
            {c.practice && (
              <span className="text-[10px] uppercase tracking-wider bg-golden/30 text-brown px-2.5 py-1 rounded-full">
                {c.practice}
              </span>
            )}
            {c.hrt_friendly && (
              <span className="text-[10px] uppercase tracking-wider bg-coral/25 text-terra px-2.5 py-1 rounded-full font-semibold">
                {t("doctor.hrtFriendly")}
              </span>
            )}
          </div>
          {c.province && (
            <p className="text-sm text-brown/60">{c.province}</p>
          )}
          {c.contact && !hasBookingUrl && (
            <p className="text-sm text-brown/80 mt-2 leading-relaxed">
              <span className="font-semibold">{t("doctor.contactLabel")}:</span>{" "}
              {c.contact}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {(c.languages ?? []).map((l) => (
              <span
                key={l}
                className="text-[11px] bg-brown/5 border border-brown/10 text-brown/70 px-2.5 py-0.5 rounded-full"
              >
                {l}
              </span>
            ))}
            {c.format && (
              <span className="text-[11px] bg-coral/20 text-terra px-2.5 py-0.5 rounded-full font-semibold">
                {filterLabel(c.format)}
              </span>
            )}
          </div>
        </div>
        {hasBookingUrl ? (
          <a
            href={c.booking_url!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              void logEngagement({
                eventType: "doctor_book_click",
                targetId: c.id,
                meta: {
                  province: c.province ?? undefined,
                  format: c.format ?? undefined,
                },
              })
            }
            className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-6 py-3 text-sm hover:bg-terra-dark active:scale-95 transition-all shadow-warm text-center"
          >
            {t("doctor.bookConsult")}
          </a>
        ) : (
          <p className="flex-shrink-0 text-xs text-brown/50 italic max-w-[180px] text-center">
            {t("doctor.contactBelow")}
          </p>
        )}
      </div>
    </Reveal>
  );
}

function DoctorCard({ doctor: d, index }: { doctor: DoctorRow; index: number }) {
  const { t } = useTranslation("common");
  const hasBookingUrl = !!d.booking_url;
  // Strip "Dr." for the "Book with {{name}}" first-name greeting.
  const firstName =
    d.name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/)[0] ?? d.name;
  return (
    <Reveal as="article" variant="stitch" delay={index * 110}>
      <div className="group h-full bg-cream-soft rounded-3xl shadow-warm p-7 flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-warm-lg">
        <Link
          href={`/find-a-doctor/${d.id}`}
          className="flex flex-col items-center text-center w-full"
        >
          {d.photo_url ? (
            <Image
              src={d.photo_url}
              alt={d.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mb-4 shadow-warm ring-2 ring-cream-soft transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-golden via-pink-mandi to-terra mb-4 shadow-warm ring-2 ring-cream-soft flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="font-display text-2xl text-cream drop-shadow">
                {initials(d.name)}
              </span>
            </div>
          )}
          <h3 className="font-display text-xl text-brown group-hover:text-terra transition-colors">
            {d.name}
          </h3>
          {d.practice && (
            <p className="text-terra text-sm font-semibold mt-0.5">{d.practice}</p>
          )}
          <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
            {(d.languages ?? []).map((l) => (
              <span
                key={l}
                className="text-[11px] bg-golden/25 text-brown px-2.5 py-0.5 rounded-full font-medium"
              >
                {l}
              </span>
            ))}
          </div>
          {d.bio && (
            <p className="text-brown/75 text-sm leading-relaxed mt-4 line-clamp-3">
              {d.bio}
            </p>
          )}
        </Link>
        {hasBookingUrl ? (
          <a
            href={d.booking_url!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              void logEngagement({
                eventType: "doctor_book_click",
                targetId: d.id,
              });
            }}
            className="mt-5 bg-terra text-cream font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-terra-dark active:scale-95 transition-all"
          >
            {t("doctor.bookWith", { name: firstName })}
          </a>
        ) : (
          <Link
            href={`/find-a-doctor/${d.id}`}
            className="mt-5 text-xs text-brown/60 hover:text-terra underline"
          >
            {t("doctor.viewProfile")} →
          </Link>
        )}
      </div>
    </Reveal>
  );
}

function FilterRow({
  label,
  items,
  value,
  onChange,
  labelFor,
}: {
  label: string;
  items: readonly string[];
  value: string;
  onChange: (v: string) => void;
  labelFor: (v: string) => string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const active = value === it;
          return (
            <button
              key={it}
              onClick={() => onChange(it)}
              className={`text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200
                hover:-translate-y-0.5 active:scale-95
                ${
                  active
                    ? "bg-golden text-brown shadow-warm"
                    : "bg-cream-soft text-terra border border-coral/30 hover:bg-coral/10"
                }`}
            >
              {labelFor(it)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
