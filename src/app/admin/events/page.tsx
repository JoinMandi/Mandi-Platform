"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchEvents, updateEventStatus } from "@/server/actions/events";
import CreateEventModal from "@/components/admin/CreateEventModal";
import Button from "@/components/ui/Button";
import type { EventStatus, EventFormat } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

const STATUS_STYLE: Record<EventStatus, string> = {
  pending:   "bg-golden/25 text-brown",
  approved:  "bg-coral/25 text-terra",
  published: "bg-green-600/15 text-green-800",
};

const PROVINCES = ["all", "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape"];

const translationFor = (e: EventWithTranslations) => {
  const tr = e.event_translations ?? [];
  return tr.find((t) => t.language_code === "en") ?? tr[0];
};
const nameOf = (e: EventWithTranslations): string => translationFor(e)?.name || "(untitled)";
const descOf = (e: EventWithTranslations): string | null => translationFor(e)?.description ?? null;
const langsOf = (e: EventWithTranslations): string =>
  (e.event_translations ?? []).map((t) => t.language_code.toUpperCase()).join(", ") || "—";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventWithTranslations[] | null>(null);
  const [status, setStatus] = useState<"all" | EventStatus>("pending");
  const [province, setProvince] = useState<string>("all");
  const [format, setFormat] = useState<"all" | EventFormat>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = async () => {
    setEvents(await fetchEvents());
  };

  useEffect(() => {
    void load();
  }, []);

  // Auto-dismiss toast after 5s.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!events) return null;
    return events.filter(
      (e) =>
        (status === "all" || e.status === status) &&
        (province === "all" || e.province === province) &&
        (format === "all" || e.format === format),
    );
  }, [events, status, province, format]);

  const setRowStatus = async (id: string, next: EventStatus) => {
    await updateEventStatus(id, next);
    await load();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <header>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Moderation</p>
          <h1 className="font-display text-4xl text-brown">Events</h1>
          <p className="text-brown/65 mt-2 max-w-xl">
            Review submitted events. Approved events become published automatically on the Gathering page.
          </p>
        </header>
        <Button onClick={() => setCreateOpen(true)} className="bg-terra">
          + New event
        </Button>
      </div>

      <div className="space-y-3 mb-6">
        <FilterRow label="Status" value={status} onChange={(v) => setStatus(v as typeof status)}
          options={[["all","All"],["pending","Pending"],["approved","Approved"],["published","Published"]]} />
        <FilterRow label="Province" value={province} onChange={setProvince}
          options={PROVINCES.map((p) => [p, p === "all" ? "All provinces" : p] as [string, string])} />
        <FilterRow label="Format" value={format} onChange={(v) => setFormat(v as typeof format)}
          options={[["all","All"],["inperson","In-person"],["online","Online"]]} />
      </div>

      <div className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden">
        {filtered === null ? (
          <p className="px-6 py-10 text-sm text-brown/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-brown/50">No events match.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-deep/40 text-brown/60 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">When</th>
                <th className="text-left px-5 py-3 font-semibold">Event</th>
                <th className="text-left px-5 py-3 font-semibold">Province</th>
                <th className="text-left px-5 py-3 font-semibold">Format</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  expanded={expanded === e.id}
                  onExpand={() => setExpanded(expanded === e.id ? null : e.id)}
                  onApprove={() => setRowStatus(e.id, "approved")}
                  onPublish={() => setRowStatus(e.id, "published")}
                  onReject={() => setRowStatus(e.id, "pending")}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create event modal */}
      <CreateEventModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setToast("Event added to the pending queue.");
          void load();
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-brown text-cream rounded-2xl shadow-warm-xl px-5 py-3 text-sm font-medium max-w-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] uppercase tracking-[0.2em] text-brown/50 font-semibold w-16">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(([v, l]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-colors
              ${value === v
                ? "bg-brown text-cream border-brown"
                : "bg-cream-soft text-brown/70 border-cream-deep hover:border-terra hover:text-terra"}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function EventRow({
  event,
  expanded,
  onExpand,
  onApprove,
  onPublish,
  onReject,
}: {
  event: EventWithTranslations;
  expanded: boolean;
  onExpand: () => void;
  onApprove: () => void;
  onPublish: () => void;
  onReject: () => void;
}) {
  const dateStr = event.date ? new Date(event.date).toLocaleDateString() : "–";
  return (
    <>
      <tr className="border-t border-cream-deep/40 hover:bg-cream">
        <td className="px-5 py-4 text-brown/70 whitespace-nowrap">{dateStr}</td>
        <td className="px-5 py-4">
          <p className="font-semibold text-brown">{nameOf(event)}</p>
          <p className="text-xs text-brown/55">{event.host ?? "—"}</p>
        </td>
        <td className="px-5 py-4 text-brown/70">{event.province ?? "—"}</td>
        <td className="px-5 py-4 text-brown/70 capitalize">
          {event.format === "inperson" ? "In-person" : event.format === "online" ? "Online" : "—"}
        </td>
        <td className="px-5 py-4">
          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLE[event.status]}`}>
            {event.status}
          </span>
        </td>
        <td className="px-5 py-4 text-right whitespace-nowrap">
          <button onClick={onExpand} className="text-xs text-terra font-semibold hover:text-brown mr-3">
            {expanded ? "Hide" : "View"}
          </button>
          {event.status === "pending" && (
            <button onClick={onApprove}
              className="text-xs bg-coral/20 text-terra font-semibold px-3 py-1.5 rounded-full hover:bg-coral/30">
              Approve
            </button>
          )}
          {event.status === "approved" && (
            <button onClick={onPublish}
              className="text-xs bg-terra text-cream font-semibold px-3 py-1.5 rounded-full hover:bg-terra-dark">
              Publish
            </button>
          )}
          {event.status !== "pending" && (
            <button onClick={onReject}
              className="text-xs bg-brown/10 text-brown/70 font-semibold px-3 py-1.5 rounded-full hover:bg-brown/20 ml-2">
              Unpublish
            </button>
          )}
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={6} className="bg-cream px-6 py-5 border-t border-cream-deep/40">
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="grid sm:grid-cols-2 gap-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-brown/50 mb-1">Description</p>
                  <p className="text-sm text-brown/80 leading-relaxed">{descOf(event) || "—"}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <Detail label="Location" value={event.location} />
                  <Detail label="Online URL" value={event.online_url} isLink />
                  <Detail label="Registration" value={event.registration_url} isLink />
                  <Detail label="Languages" value={langsOf(event)} />
                  <Detail label="Cost" value={event.free ? "Free" : event.cost} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

function Detail({ label, value, isLink }: { label: string; value: string | null; isLink?: boolean }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-xs uppercase tracking-wider text-brown/50 mr-2">{label}:</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noreferrer" className="text-terra link-warm break-all">{value}</a>
      ) : (
        <span className="text-brown/80">{value}</span>
      )}
    </p>
  );
}
