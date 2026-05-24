"use client";

/**
 * Phase 20 — admin-authored event creation modal.
 *
 * Writes both an `events` row and an English `event_translations` row
 * (Mandi events are multilingual; the canonical events table doesn't
 * carry name/description columns). Goes to the `pending` queue per
 * user decision.
 *
 * Heads-up: the public `/events` page is currently hardcoded
 * (Phase 21 flag) — events created here won't appear publicly until
 * that page is rewritten to read from the DB.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { createEvent } from "@/server/actions/events";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export default function CreateEventModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [host, setHost] = useState("");
  const [format, setFormat] = useState<"inperson" | "online">("inperson");
  const [location, setLocation] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [province, setProvince] = useState("");
  const [type, setType] = useState("");
  const [free, setFree] = useState(true);
  const [cost, setCost] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setDescription("");
    setDate("");
    setHost("");
    setFormat("inperson");
    setLocation("");
    setOnlineUrl("");
    setProvince("");
    setType("");
    setFree(true);
    setCost("");
    setRegistrationUrl("");
    setError(null);
    setSubmitting(false);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    // `datetime-local` returns "YYYY-MM-DDTHH:mm". Pass through as-is;
    // Postgres timestamptz parses it. (The DB will treat it as the
    // server's TZ if no zone suffix — acceptable for MVP.)
    const res = await createEvent({
      name,
      description: description || undefined,
      date,
      host,
      format,
      location: location || undefined,
      onlineUrl: onlineUrl || undefined,
      province: province || undefined,
      type: type || undefined,
      free,
      cost: cost || undefined,
      registrationUrl: registrationUrl || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const id = res.id;
    reset();
    onCreated(id);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-brown-deep/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-start justify-center px-5 overflow-y-auto py-10"
          >
            <form
              onSubmit={submit}
              className="bg-cream-soft rounded-3xl shadow-warm-xl w-full max-w-2xl p-7"
            >
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                New event
              </p>
              <h2 className="font-display text-2xl text-brown mb-2">
                Add a Mandi gathering
              </h2>
              <p className="text-brown/65 text-sm leading-relaxed mb-5">
                Goes to the pending queue. Once approved + published, the
                event becomes visible to the public.
              </p>

              <label className="block mb-4">
                <FieldLabel>Event name</FieldLabel>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  placeholder="Cape Town menopause circle"
                  className={inputClass}
                />
              </label>

              <label className="block mb-4">
                <FieldLabel>Description (optional)</FieldLabel>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                  placeholder="What attendees should expect…"
                  className={inputClass + " leading-relaxed"}
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <label className="block">
                  <FieldLabel>Date &amp; time</FieldLabel>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={submitting}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Host</FieldLabel>
                  <input
                    type="text"
                    required
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    disabled={submitting}
                    placeholder="Dr Funeka Bango"
                    className={inputClass}
                  />
                </label>
              </div>

              <fieldset className="mb-4" disabled={submitting}>
                <FieldLabel>Format</FieldLabel>
                <div className="flex gap-2 mt-1">
                  {(["inperson", "online"] as const).map((f) => (
                    <label
                      key={f}
                      className={`text-sm px-4 py-2 rounded-full cursor-pointer border-2 transition-colors ${
                        format === f
                          ? "bg-terra text-cream border-terra"
                          : "bg-cream border-cream-deep text-brown/70 hover:border-terra/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={f}
                        checked={format === f}
                        onChange={() => setFormat(f)}
                        className="sr-only"
                      />
                      {f === "inperson" ? "In person" : "Online"}
                    </label>
                  ))}
                </div>
              </fieldset>

              {format === "inperson" && (
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <label className="block">
                    <FieldLabel>Location</FieldLabel>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={submitting}
                      placeholder="Constitution Hill, Braamfontein"
                      className={inputClass}
                    />
                  </label>
                  <label className="block">
                    <FieldLabel>Province</FieldLabel>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      disabled={submitting}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {format === "online" && (
                <label className="block mb-4">
                  <FieldLabel>Online meeting URL</FieldLabel>
                  <input
                    type="url"
                    required
                    value={onlineUrl}
                    onChange={(e) => setOnlineUrl(e.target.value)}
                    disabled={submitting}
                    placeholder="https://zoom.us/j/…"
                    className={inputClass}
                  />
                </label>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <label className="block">
                  <FieldLabel>Type (optional)</FieldLabel>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={submitting}
                    placeholder="Workshop · Circle · Talk"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <FieldLabel>Registration URL (optional)</FieldLabel>
                  <input
                    type="url"
                    value={registrationUrl}
                    onChange={(e) => setRegistrationUrl(e.target.value)}
                    disabled={submitting}
                    placeholder="https://…"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={free}
                    onChange={(e) => setFree(e.target.checked)}
                    disabled={submitting}
                    className="accent-terra"
                  />
                  <span className="text-sm text-brown/85">Free to attend</span>
                </label>
                {!free && (
                  <label className="flex-1 flex items-center gap-2">
                    <span className="text-sm text-brown/65 whitespace-nowrap">Cost</span>
                    <input
                      type="text"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      disabled={submitting}
                      placeholder="R250 / R150 conc."
                      className={inputClass}
                    />
                  </label>
                )}
              </div>

              {error && (
                <p className="text-terra text-sm mb-4 bg-terra/10 rounded-2xl px-4 py-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 justify-end items-center">
                <button
                  type="button"
                  onClick={close}
                  disabled={submitting}
                  className="text-sm text-brown/70 font-semibold px-4 py-2.5 disabled:opacity-40"
                >
                  Cancel
                </button>
                <Button type="submit" disabled={submitting} className="bg-terra">
                  {submitting ? "Saving…" : "Add to pending queue"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputClass =
  "w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-brown disabled:opacity-50";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
      {children}
    </span>
  );
}
