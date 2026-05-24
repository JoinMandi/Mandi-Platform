"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchUserTimeline, type UserTimeline } from "@/server/actions/admin-crm";
import EngagementHeatmap from "@/components/admin/EngagementHeatmap";

const PERSONA_LABEL: Record<string, string> = {
  sally: "Searching Sally",
  olga: "Oblivious Olga",
  vicky: "Victim Vicky",
  nelly: "Know-it-all Nelly",
  nina: "Natural Nina",
  retha: "Regretting Retha",
  colleen: "Comorbid Colleen",
};
const BAND_LABEL: Record<string, string> = {
  mild: "Mild — early signals",
  moderate: "Moderate — active hormonal change",
  significant: "Significant impact",
};

export default function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<UserTimeline | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await fetchUserTimeline(id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        <p className="text-terra">Failed to load: {error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        <p className="text-brown/50 text-sm">Loading…</p>
      </div>
    );
  }

  const u = data.user;

  return (
    <div className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
      <Link
        href="/admin/users"
        className="text-terra text-sm font-semibold inline-flex items-center gap-1 mb-6 hover:gap-2 transition-all"
      >
        ← Back to users
      </Link>

      {/* Profile header */}
      <header className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">User profile</p>
        <h1 className="font-display text-3xl text-brown break-all">
          {u?.email ?? id.slice(0, 8)}
        </h1>
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <Pill label="Role" value={u?.role ?? "—"} />
          <Pill label="Language" value={(u?.language_code ?? "en").toUpperCase()} />
          <Pill
            label="Joined"
            value={u ? new Date(u.created_at).toLocaleDateString() : "—"}
          />
        </div>
      </header>

      {/* Latest questionnaire */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Latest questionnaire</h2>
        {!data.latest ? (
          <p className="text-brown/50 text-sm mt-3">She hasn&rsquo;t taken the questionnaire yet.</p>
        ) : (
          <div className="grid sm:grid-cols-[auto,1fr] gap-6 items-center mt-4">
            <div className="bg-terra/10 border-2 border-terra/30 rounded-3xl px-7 py-5 text-center min-w-[140px]">
              <p className="font-display text-5xl text-terra leading-none">{data.latest.meno_score ?? "—"}</p>
              <p className="text-[10px] uppercase tracking-wider text-brown/55 mt-1">MenoScore</p>
            </div>
            <div>
              <p className="font-display text-xl text-brown leading-snug">
                {data.latest.persona ? PERSONA_LABEL[data.latest.persona] : "—"}
                {data.latest.score_band ? ` · ${BAND_LABEL[data.latest.score_band]}` : ""}
              </p>
              <p className="text-brown/65 text-sm mt-1">
                Completed {new Date(data.latest.completed_at).toLocaleString()}
              </p>
              {data.latest.top_domains && data.latest.top_domains.length > 0 && (
                <p className="text-xs text-brown/55 mt-2">
                  Top domains: {data.latest.top_domains.join(" · ")}
                </p>
              )}
              {(data.latest.self_harm_flag || data.latest.colleen_flag) && (
                <div className="mt-3 flex gap-2">
                  {data.latest.self_harm_flag && (
                    <span className="text-[11px] bg-brown text-cream px-3 py-1 rounded-full font-semibold">
                      Self-harm flag
                    </span>
                  )}
                  {data.latest.colleen_flag && (
                    <span className="text-[11px] bg-terra text-cream px-3 py-1 rounded-full font-semibold">
                      Specialist routing
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Symptom heatmap */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Symptom tracker — last 30 days</h2>
        <p className="text-brown/60 text-sm mb-5">
          {data.logs.length} log {data.logs.length === 1 ? "entry" : "entries"} in this window.
        </p>
        {data.logs.length === 0 ? (
          <p className="text-brown/45 text-sm italic">No symptom logs yet.</p>
        ) : (
          <EngagementHeatmap logs={data.logs} />
        )}
      </section>

      {/* Check-ins */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
        <h2 className="font-display text-2xl text-brown mb-1">Check-ins</h2>
        {data.checkins.length === 0 ? (
          <p className="text-brown/45 text-sm italic mt-3">No check-ins yet.</p>
        ) : (
          <ul className="divide-y divide-cream-deep/50 mt-2">
            {data.checkins.map((c) => (
              <li key={c.id} className="py-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-brown capitalize">{c.type ?? "—"}</span>
                <span className="text-brown/60">
                  {c.completed_at ? new Date(c.completed_at).toLocaleString() : "started, not completed"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Stories */}
      {data.stories.length > 0 && (
        <section className="bg-cream-soft rounded-3xl shadow-warm p-7 mb-8">
          <h2 className="font-display text-2xl text-brown mb-3">Stories shared</h2>
          <ul className="space-y-3">
            {data.stories.map((s) => (
              <li key={s.id} className="border-l-4 border-coral pl-4">
                <p className="text-brown/85 text-sm leading-relaxed italic">&ldquo;{s.content}&rdquo;</p>
                <p className="text-xs text-brown/50 mt-1">
                  {s.status} · {new Date(s.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recent engagement events */}
      <section className="bg-cream-soft rounded-3xl shadow-warm p-7">
        <h2 className="font-display text-2xl text-brown mb-1">Recent activity</h2>
        <p className="text-brown/60 text-sm mb-5">Last 20 tracked interactions.</p>
        {data.events.length === 0 ? (
          <p className="text-brown/45 text-sm italic">No engagement events yet (Phase-8 migration may not be applied).</p>
        ) : (
          <ul className="divide-y divide-cream-deep/50">
            {data.events.map((e, i) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="py-2 flex items-center justify-between text-sm"
              >
                <span className="text-brown/80">
                  <span className="font-semibold capitalize">{e.event_type.replaceAll("_", " ")}</span>
                  {e.target_id && (
                    <span className="text-brown/55 font-mono text-xs ml-3">{e.target_id}</span>
                  )}
                </span>
                <span className="text-brown/50 text-xs">{new Date(e.created_at).toLocaleString()}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-2 bg-cream-deep/40 rounded-full px-3 py-1">
      <span className="text-[10px] uppercase tracking-wider text-brown/55 font-semibold">
        {label}
      </span>
      <span className="text-brown font-medium">{value}</span>
    </span>
  );
}
