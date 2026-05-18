"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";

const EVENTS = [
  {
    title: "Meer as Warm Gloede — Community Screening",
    day: "22", month: "AUG", year: "2026",
    time: "18:00", city: "Cape Town", province: "Western Cape",
    lang: "Afrikaans · English",
    format: "inperson",
    host: "MrsKing Productions",
    description:
      "The kykNET documentary on the big screen. Community screenings followed by a facilitated conversation — in a venue near you.",
    cost: "Free",
  },
  {
    title: "Ask a Menopause Specialist — Live Online",
    day: "14", month: "SEP", year: "2026",
    time: "19:30", city: "Online", province: "",
    lang: "English",
    format: "online",
    host: "Dr Funeka Bango",
    description:
      "A live Q&A with an integrative doctor. Bring your questions about HRT, body-identical hormones, and practical next steps.",
    cost: "Free",
  },
  {
    title: "Mandi Café — Menopause Over Coffee",
    day: "05", month: "OCT", year: "2026",
    time: "10:00", city: "Woodstock", province: "Western Cape",
    lang: "English · Afrikaans",
    format: "inperson",
    host: "Mandi Community",
    description:
      "No agenda, no pressure. Just women talking honestly about their bodies over coffee. Drop in any time.",
    cost: "Free",
  },
  {
    title: "Hormonal Health in isiZulu",
    day: "19", month: "OCT", year: "2026",
    time: "14:00", city: "Durban", province: "KwaZulu-Natal",
    lang: "isiZulu",
    format: "inperson",
    host: "Community partner",
    description:
      "A community health talk for women in KZN, in isiZulu, covering the basics of perimenopause and menopause.",
    cost: "Free",
  },
];

export default function EventsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-cream">
        <section className="relative overflow-hidden bg-mandi-gradient-soft">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
              Gather · Hlangana · Kom Saam
            </p>
            <h1 className="font-display text-5xl sm:text-6xl text-brown leading-[1.05]">
              Mandi Events
            </h1>
            <p className="text-brown/75 text-lg mt-5 max-w-xl leading-relaxed">
              Where the JoinMandi community becomes real. Menopause was private — this is where it becomes communal.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            {EVENTS.map((e, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden"
              >
                <div className="flex">
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
                        {e.format === "online" ? "Online" : "In-person"}
                      </span>
                      <span className="text-[10px] bg-brown/5 text-brown/60 px-2.5 py-0.5 rounded-full">
                        {e.cost}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-brown leading-snug">{e.title}</h3>
                    <p className="text-xs text-brown/55 mt-1 mb-3">
                      {e.time} · {e.city}{e.province && ` · ${e.province}`} · {e.lang}
                    </p>
                    <p className="text-sm text-brown/80 leading-relaxed mb-3">{e.description}</p>
                    <p className="text-[11px] text-brown/50">Hosted by {e.host}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-golden/20 border border-golden/40 rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-center gap-8 shadow-warm">
            <div className="flex-1">
              <h3 className="font-display text-2xl text-brown mb-3">Host an event on Mandi.</h3>
              <p className="text-brown/75 text-sm leading-relaxed">
                Whether you are a gynaecologist running a monthly Q&A, an NGO hosting a community morning, or
                a workplace supporting your staff — Mandi Events is your platform too. Free to list.
              </p>
            </div>
            <Link
              href="mailto:hermi@mrsking.co.za"
              className="flex-shrink-0 bg-terra text-cream font-semibold rounded-full px-8 py-4 text-sm hover:bg-terra-dark transition-colors shadow-warm whitespace-nowrap"
            >
              Submit an event →
            </Link>
          </div>
        </section>

        <section className="bg-brown py-14 mt-8">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-golden text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">Our Principle</p>
            <p className="text-cream font-display text-2xl sm:text-3xl">
              Community is always free. Expertise can carry a fee.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
