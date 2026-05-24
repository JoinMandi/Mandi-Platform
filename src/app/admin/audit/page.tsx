"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fetchAuditLog } from "@/server/actions/admin-roles";
import type { AdminAuditAction, AdminAuditLogRow } from "@/lib/types/database";

const ACTION_LABEL: Record<AdminAuditAction, string> = {
  role_change: "Role change",
  user_invite: "User invite",
  user_delete: "User deleted",
  user_view: "User view",
  story_create: "Story created",
  story_status: "Story status",
  event_create: "Event created",
  event_status: "Event status",
  content_publish: "Content publish",
  content_translation_upsert: "Content translation",
  clinic_save: "Clinic save",
  doctor_save: "Doctor save",
};

const ACTION_ACCENT: Record<AdminAuditAction, string> = {
  role_change: "bg-terra/15 text-terra",
  user_invite: "bg-golden/30 text-brown",
  user_delete: "bg-brown text-cream",
  // Muted — user_view is high-volume noise vs the privileged actions.
  user_view: "bg-cream-deep/60 text-brown/65",
  story_create: "bg-pink-mandi/20 text-pink-mandi",
  story_status: "bg-pink-mandi/20 text-pink-mandi",
  event_create: "bg-golden/30 text-brown",
  event_status: "bg-golden/30 text-brown",
  content_publish: "bg-coral/20 text-terra",
  content_translation_upsert: "bg-coral/15 text-terra",
  clinic_save: "bg-sun/20 text-terra",
  doctor_save: "bg-sun/20 text-terra",
};

const ACTIONS: AdminAuditAction[] = [
  "role_change",
  "user_invite",
  "user_delete",
  "user_view",
  "story_create",
  "story_status",
  "event_create",
  "event_status",
  "content_publish",
  "content_translation_upsert",
  "clinic_save",
  "doctor_save",
];

export default function AdminAuditPage() {
  const [rows, setRows] = useState<AdminAuditLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminAuditAction | "all">("all");

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchAuditLog(
          filter === "all" ? { limit: 200 } : { action: filter, limit: 200 },
        );
        setRows(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, [filter]);

  const grouped = useMemo(() => {
    if (!rows) return null;
    const byDay = new Map<string, AdminAuditLogRow[]>();
    for (const r of rows) {
      const day = r.created_at.slice(0, 10);
      const arr = byDay.get(day) ?? [];
      arr.push(r);
      byDay.set(day, arr);
    }
    const out: [string, AdminAuditLogRow[]][] = [];
    byDay.forEach((entries, day) => out.push([day, entries]));
    return out;
  }, [rows]);

  return (
    <div className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">
          Audit
        </p>
        <h1 className="font-display text-4xl text-brown">Admin actions log</h1>
        <p className="text-brown/65 mt-2 max-w-xl">
          Every consequential change made through the admin UI is recorded here.
          Read-only access.
        </p>
      </header>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        {ACTIONS.map((a) => (
          <FilterChip
            key={a}
            label={ACTION_LABEL[a]}
            active={filter === a}
            onClick={() => setFilter(a)}
          />
        ))}
      </div>

      {error && (
        <p className="text-terra text-sm">Failed to load: {error}</p>
      )}
      {!rows && !error && (
        <p className="text-brown/55 text-sm">Loading…</p>
      )}
      {rows && rows.length === 0 && (
        <div className="bg-cream-soft rounded-3xl shadow-warm p-7 text-center">
          <p className="text-brown/55 text-sm">No audit entries yet.</p>
        </div>
      )}
      {grouped && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map(([day, entries]) => (
            <section key={day}>
              <p className="text-[11px] uppercase tracking-[0.2em] text-brown/55 font-semibold mb-3">
                {new Date(day).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <ul className="bg-cream-soft rounded-3xl shadow-warm divide-y divide-cream-deep/40">
                {entries.map((r, i) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="px-5 py-3 flex items-baseline gap-4 text-sm"
                  >
                    <span className="text-brown/45 text-xs w-16 flex-shrink-0 font-mono">
                      {r.created_at.slice(11, 16)}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${ACTION_ACCENT[r.action]}`}
                    >
                      {ACTION_LABEL[r.action]}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="text-brown font-medium">
                        {r.actor_email ?? <span className="text-brown/40 italic">unknown actor</span>}
                      </span>
                      {r.target_id && (
                        <span className="text-brown/55 font-mono text-xs ml-2 truncate">
                          → {r.target_id}
                        </span>
                      )}
                      {r.meta && Object.keys(r.meta).length > 0 && (
                        <span className="block text-brown/55 text-xs mt-0.5">
                          {Object.entries(r.meta)
                            .map(([k, v]) => `${k}: ${String(v)}`)
                            .join(" · ")}
                        </span>
                      )}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold rounded-full px-4 py-1.5 transition-all hover:-translate-y-0.5
        ${active
          ? "bg-terra text-cream shadow-warm"
          : "bg-cream-soft text-brown/70 border border-cream-deep hover:border-terra"}`}
    >
      {label}
    </button>
  );
}
