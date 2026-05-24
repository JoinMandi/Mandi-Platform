"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NavBar from "@/components/NavBar";
import Reveal from "@/components/ui/Reveal";
import { logEngagement } from "@/server/actions/engagement";

const PROVINCES = ["All", "Western Cape", "Gauteng", "KwaZulu-Natal", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"];
const LANGUAGES = ["All", "English", "Afrikaans", "isiZulu", "isiXhosa"];
const FORMATS  = ["All", "In-person", "Online", "Both"];

// Display value -> i18n filter key, for the translatable filter terms.
const FMT_KEY: Record<string, string> = {
  All: "all",
  "In-person": "inperson",
  Online: "online",
  Both: "both",
};

const CLINICS = [
  {
    id: "newson",
    name: "Newson Health SA Partner",
    province: "Western Cape",
    city: "Cape Town",
    languages: ["English", "Afrikaans"],
    format: "Both",
  },
  {
    id: "hormonal",
    name: "Hormonal Health Centre",
    province: "Gauteng",
    city: "Johannesburg",
    languages: ["English"],
    format: "Both",
  },
  {
    id: "community",
    name: "Community Women's Clinic",
    province: "KwaZulu-Natal",
    city: "Durban",
    languages: ["English", "isiZulu"],
    format: "In-person",
  },
];

const DOCTORS = [
  { id: "bango", name: "Dr Funeka Bango", languages: ["English", "isiXhosa"] },
  { id: "vandyk", name: "Dr Sarah van Dyk", languages: ["English", "Afrikaans"] },
];

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function FindADoctorPage() {
  const { t } = useTranslation("common");
  const [province, setProvince] = useState("All");
  const [language, setLanguage] = useState("All");
  const [format, setFormat] = useState("All");

  const filtered = CLINICS.filter((c) => {
    const pOk = province === "All" || c.province === province;
    const lOk = language === "All" || c.languages.includes(language);
    const fOk = format   === "All" || c.format === format || c.format === "Both";
    return pOk && lOk && fOk;
  });

  // Track a doctor_view per clinic shown — once per mount per visible item.
  useEffect(() => {
    for (const c of filtered) {
      void logEngagement({
        eventType: "doctor_view",
        targetId: c.id,
        meta: { province: c.province, format: c.format.toLowerCase() },
      });
    }
    for (const d of DOCTORS) {
      void logEngagement({ eventType: "doctor_view", targetId: d.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, language, format]);

  // The filter term itself is translated where it is a generic word; province
  // and language names are proper nouns and stay as-is.
  const filterLabel = (v: string) => (FMT_KEY[v] ? t(`doctor.filter.${FMT_KEY[v]}`) : v);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
            <Reveal>
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                {t("doctor.eyebrow")}
              </p>
            </Reveal>
            <Reveal delay={110}>
              <h1 className="font-display text-4xl sm:text-5xl text-brown leading-[1.1] max-w-2xl">
                {t("doctor.title")}
              </h1>
            </Reveal>
            <Reveal delay={210}>
              <p className="text-brown/75 text-base mt-5 max-w-xl">{t("doctor.subhead")}</p>
            </Reveal>
          </div>
        </section>

        {/* Filter pills */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <Reveal>
            <FilterRow label={t("doctor.filter.province")} items={PROVINCES} value={province} onChange={setProvince} labelFor={filterLabel} />
            <FilterRow label={t("doctor.filter.language")} items={LANGUAGES} value={language} onChange={setLanguage} labelFor={filterLabel} />
            <FilterRow label={t("doctor.filter.format")}   items={FORMATS}   value={format}   onChange={setFormat}   labelFor={filterLabel} />
          </Reveal>
        </section>

        {/* Directory */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          {filtered.length === 0 ? (
            <Reveal variant="fade">
              <p className="text-center py-16 text-brown/50 text-sm">{t("doctor.empty")}</p>
            </Reveal>
          ) : (
            <div className="grid gap-4">
              {filtered.map((c, i) => (
                <Reveal as="article" key={c.id} delay={Math.min(i, 6) * 70}>
                  <div className="bg-cream-soft rounded-3xl shadow-warm p-6 flex flex-col sm:flex-row sm:items-center gap-5 border-l-4 border-terra transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-display text-xl text-brown">{c.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider bg-golden/30 text-brown px-2.5 py-1 rounded-full">
                          {t(`doctor.clinics.${c.id}.practice`)}
                        </span>
                      </div>
                      <p className="text-sm text-brown/60">{c.city}, {c.province}</p>
                      <p className="text-sm text-brown/80 mt-2 leading-relaxed">
                        {t(`doctor.clinics.${c.id}.note`)}
                      </p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {c.languages.map((l) => (
                          <span key={l} className="text-[11px] bg-brown/5 border border-brown/10 text-brown/70 px-2.5 py-0.5 rounded-full">{l}</span>
                        ))}
                        <span className="text-[11px] bg-coral/20 text-terra px-2.5 py-0.5 rounded-full font-semibold">
                          {filterLabel(c.format)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        void logEngagement({
                          eventType: "doctor_book_click",
                          targetId: c.id,
                          meta: { province: c.province, format: c.format.toLowerCase() },
                        })
                      }
                      className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-6 py-3 text-sm hover:bg-terra-dark active:scale-95 transition-all shadow-warm"
                    >
                      {t("doctor.bookConsult")}
                    </button>
                  </div>
                </Reveal>
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
            <div className="grid sm:grid-cols-2 gap-5">
              {DOCTORS.map((d, i) => (
                <Reveal as="article" key={d.id} variant="stitch" delay={i * 110}>
                  <div className="group h-full bg-cream-soft rounded-3xl shadow-warm p-7 flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-warm-lg">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-golden via-pink-mandi to-terra mb-4 shadow-warm ring-2 ring-cream-soft flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <span className="font-display text-2xl text-cream drop-shadow">{initials(d.name)}</span>
                    </div>
                    <h3 className="font-display text-xl text-brown">{d.name}</h3>
                    <p className="text-terra text-sm font-semibold mt-0.5">
                      {t(`doctor.doctors.${d.id}.practice`)}
                    </p>
                    <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
                      {d.languages.map((l) => (
                        <span key={l} className="text-[11px] bg-golden/25 text-brown px-2.5 py-0.5 rounded-full font-medium">{l}</span>
                      ))}
                    </div>
                    <p className="text-brown/75 text-sm leading-relaxed mt-4">
                      {t(`doctor.doctors.${d.id}.blurb`)}
                    </p>
                    <button
                      onClick={() =>
                        void logEngagement({
                          eventType: "doctor_book_click",
                          targetId: d.id,
                        })
                      }
                      className="mt-5 bg-terra text-cream font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-terra-dark active:scale-95 transition-all"
                    >
                      {t("doctor.bookWith", { name: d.name.split(" ")[1] })}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
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
  items: string[];
  value: string;
  onChange: (v: string) => void;
  labelFor: (v: string) => string;
}) {
  return (
    <div className="mb-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const active = value === it;
          return (
            <button
              key={it}
              onClick={() => onChange(it)}
              className={`text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200
                hover:-translate-y-0.5 active:scale-95
                ${active
                  ? "bg-golden text-brown shadow-warm"
                  : "bg-cream-soft text-terra border border-coral/30 hover:bg-coral/10"}`}
            >
              {labelFor(it)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
