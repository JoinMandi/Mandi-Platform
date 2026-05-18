"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";

const PROVINCES = ["All", "Western Cape", "Gauteng", "KwaZulu-Natal", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"];
const LANGUAGES = ["All", "English", "Afrikaans", "isiZulu", "isiXhosa"];
const FORMATS  = ["All", "In-person", "Online", "Both"];

const CLINICS = [
  {
    name: "Newson Health SA Partner",
    practice: "Private GP",
    province: "Western Cape",
    city: "Cape Town",
    languages: ["English", "Afrikaans"],
    format: "Both",
    note: "HRT specialist. Body-identical hormone therapy.",
  },
  {
    name: "Hormonal Health Centre",
    practice: "Gynaecology Practice",
    province: "Gauteng",
    city: "Johannesburg",
    languages: ["English"],
    format: "Both",
    note: "Menopause specialist. Online and in-person consultations.",
  },
  {
    name: "Community Women's Clinic",
    practice: "Public Health",
    province: "KwaZulu-Natal",
    city: "Durban",
    languages: ["English", "isiZulu"],
    format: "In-person",
    note: "Free or subsidised care. Referral pathway available.",
  },
];

const DOCTORS = [
  {
    name: "Dr Funeka Bango",
    practice: "Integrative Medicine",
    languages: ["English", "isiXhosa"],
    blurb: "Clinical advisor to JoinMandi. A warm, evidence-forward practitioner with a focus on hormonal health for African women.",
  },
  {
    name: "Dr Sarah van Dyk",
    practice: "Gynaecology & Menopause",
    languages: ["English", "Afrikaans"],
    blurb: "HRT-trained GP practising in Stellenbosch. Body-identical HRT specialist with telehealth across South Africa.",
  },
];

export default function FindADoctorPage() {
  const [province, setProvince] = useState("All");
  const [language, setLanguage] = useState("All");
  const [format, setFormat] = useState("All");

  const filtered = CLINICS.filter((c) => {
    const pOk = province === "All" || c.province === province;
    const lOk = language === "All" || c.languages.includes(language);
    const fOk = format   === "All" || c.format === format || c.format === "Both";
    return pOk && lOk && fOk;
  });

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        {/* Hero */}
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
              Find a Doctor
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-brown leading-[1.1] max-w-2xl">
              Care that speaks your language.
            </h1>
            <p className="text-brown/75 text-base mt-5 max-w-xl">
              HRT-informed practitioners across South Africa — private, public, and online. Filter by province,
              language, and format.
            </p>
          </div>
        </section>

        {/* Filter pills */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <FilterRow label="Province" items={PROVINCES} value={province} onChange={setProvince} />
          <FilterRow label="Language" items={LANGUAGES} value={language} onChange={setLanguage} />
          <FilterRow label="Format"   items={FORMATS}   value={format}   onChange={setFormat} />
        </section>

        {/* Directory */}
        <section className="max-w-4xl mx-auto px-6 pb-12">
          {filtered.length === 0 ? (
            <p className="text-center py-16 text-brown/50 text-sm">
              No clinics found for your selection. More are being added regularly.
            </p>
          ) : (
            <div className="grid gap-4">
              {filtered.map((c) => (
                <motion.article
                  key={c.name}
                  whileHover={{ y: -2 }}
                  className="bg-cream-soft rounded-3xl shadow-warm p-6 flex flex-col sm:flex-row sm:items-center gap-5 border-l-4 border-terra"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-display text-xl text-brown">{c.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider bg-golden/30 text-brown px-2.5 py-1 rounded-full">
                        {c.practice}
                      </span>
                    </div>
                    <p className="text-sm text-brown/60">{c.city}, {c.province}</p>
                    <p className="text-sm text-brown/80 mt-2 leading-relaxed">{c.note}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {c.languages.map((l) => (
                        <span key={l} className="text-[11px] bg-brown/5 border border-brown/10 text-brown/70 px-2.5 py-0.5 rounded-full">{l}</span>
                      ))}
                      <span className="text-[11px] bg-coral/20 text-terra px-2.5 py-0.5 rounded-full font-semibold">
                        {c.format}
                      </span>
                    </div>
                  </div>
                  <button className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-6 py-3 text-sm hover:bg-terra-dark transition-colors shadow-warm">
                    Book consult
                  </button>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* Meet the Doctors */}
        <section className="bg-cream-deep/30 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-2 text-center">
              Meet the Doctors
            </p>
            <h2 className="font-display text-3xl text-brown text-center mb-10">
              Faces you can trust.
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {DOCTORS.map((d) => (
                <article key={d.name} className="bg-cream-soft rounded-3xl shadow-warm p-7 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-golden via-pink-mandi to-terra mb-4 shadow-warm" />
                  <h3 className="font-display text-xl text-brown">{d.name}</h3>
                  <p className="text-terra text-sm font-semibold mt-0.5">{d.practice}</p>
                  <div className="flex gap-1.5 mt-3 flex-wrap justify-center">
                    {d.languages.map((l) => (
                      <span key={l} className="text-[11px] bg-golden/25 text-brown px-2.5 py-0.5 rounded-full font-medium">{l}</span>
                    ))}
                  </div>
                  <p className="text-brown/75 text-sm leading-relaxed mt-4">{d.blurb}</p>
                  <button className="mt-5 bg-terra text-cream font-semibold rounded-full px-6 py-2.5 text-sm hover:bg-terra-dark transition-colors">
                    Book with {d.name.split(" ")[1]}
                  </button>
                </article>
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
}: {
  label: string;
  items: string[];
  value: string;
  onChange: (v: string) => void;
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
              className={`text-xs px-4 py-2 rounded-full font-semibold transition-colors
                ${active
                  ? "bg-golden text-brown shadow-warm"
                  : "bg-cream-soft text-terra border border-coral/30 hover:bg-coral/10"}`}
            >
              {it}
            </button>
          );
        })}
      </div>
    </div>
  );
}
