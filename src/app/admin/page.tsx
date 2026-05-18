"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchDashboardStats } from "@/server/actions/admin";

type Stats = {
  pendingStories: number;
  pendingEvents: number;
  totalUsers: number;
  publishedClinics: number;
  totalResponses: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void (async () => {
      setStats(await fetchDashboardStats());
    })();
  }, []);

  const cards = [
    { label: "Pending Stories",  value: stats?.pendingStories,   href: "/admin/stories", accent: "border-pink-mandi" },
    { label: "Pending Events",   value: stats?.pendingEvents,    href: "/admin/events",  accent: "border-golden" },
    { label: "Total Users",      value: stats?.totalUsers,       href: "/admin/users",   accent: "border-terra" },
    { label: "Published Clinics",value: stats?.publishedClinics, href: "/admin/clinics", accent: "border-sun" },
  ];

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Admin</p>
        <h1 className="font-display text-4xl text-brown">Dashboard</h1>
        <p className="text-brown/65 mt-2">A snapshot of what needs your attention on Mandi.</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Link
              href={c.href}
              className={`block bg-cream-soft rounded-3xl shadow-warm p-6 border-l-4 ${c.accent} hover:shadow-warm-lg hover:-translate-y-0.5 transition-all`}
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-3">
                {c.label}
              </p>
              <p className="font-display text-5xl text-brown leading-none">
                {c.value === undefined ? "–" : c.value}
              </p>
              <p className="text-terra text-xs font-semibold mt-4">Manage →</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <section className="mt-14 bg-cream-soft rounded-3xl shadow-warm p-8">
        <h2 className="font-display text-2xl text-brown mb-2">What women have said.</h2>
        <p className="text-brown/65 text-sm mb-4">
          Total questionnaires submitted on Mandi:
        </p>
        <p className="font-display text-6xl text-terra">
          {stats?.totalResponses ?? "–"}
        </p>
        <p className="text-xs text-brown/50 mt-4 leading-relaxed max-w-xl">
          Every one of these is a woman who chose to open up about her symptoms. Moderate the stories she chose to
          share, publish the content she needs next, and keep the directory accurate so she can find help.
        </p>
      </section>
    </div>
  );
}
