"use client";

/**
 * Phase 20 — admin-authored story creation modal.
 *
 * The public submission flow is currently a `mailto:` link on
 * `/honour-the-mothers`; this is the first in-app authoring path. Per
 * user decision, admin-created stories still flow through the same
 * `pending` queue (uniform audit trail), so the admin can approve
 * their own submission from the same page after creating it.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { createStory } from "@/server/actions/stories";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "af", label: "Afrikaans" },
] as const;

export default function CreateStoryModal({ open, onClose, onCreated }: Props) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [languageCode, setLanguageCode] = useState<string>("en");
  const [tagsInput, setTagsInput] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setContent("");
    setAuthorName("");
    setLanguageCode("en");
    setTagsInput("");
    setConsent(false);
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
    const symptomTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const res = await createStory({
      content,
      authorName: authorName || undefined,
      languageCode,
      symptomTags: symptomTags.length > 0 ? symptomTags : undefined,
      consent,
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
            className="fixed inset-0 z-50 flex items-center justify-center px-5 overflow-y-auto py-10"
          >
            <form
              onSubmit={submit}
              className="bg-cream-soft rounded-3xl shadow-warm-xl w-full max-w-xl p-7"
            >
              <p className="text-terra text-[11px] uppercase tracking-[0.25em] font-semibold mb-3">
                New story
              </p>
              <h2 className="font-display text-2xl text-brown mb-2">
                Share a story on her behalf
              </h2>
              <p className="text-brown/65 text-sm leading-relaxed mb-5">
                Goes to the pending queue so a moderator (or you) can review
                it before it appears on the public page.
              </p>

              <label className="block mb-4">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
                  Story
                </span>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={submitting}
                  placeholder="Her words, in her voice…"
                  className="w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-3 text-sm text-brown disabled:opacity-50 leading-relaxed"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <label className="block">
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
                    Author name (optional)
                  </span>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    disabled={submitting}
                    placeholder="Anonymous if blank"
                    className="w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-brown disabled:opacity-50"
                  />
                </label>

                <label className="block">
                  <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
                    Language
                  </span>
                  <select
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    disabled={submitting}
                    className="w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-brown disabled:opacity-50"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block mb-5">
                <span className="block text-[11px] uppercase tracking-[0.2em] text-brown/65 font-semibold mb-1.5">
                  Tags (optional, comma-separated)
                </span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={submitting}
                  placeholder="hot-flushes, sleep, mood"
                  className="w-full bg-cream border-2 border-cream-deep focus:border-terra focus:outline-none rounded-2xl px-4 py-2.5 text-sm text-brown disabled:opacity-50"
                />
              </label>

              <label className="flex items-start gap-3 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={submitting}
                  className="mt-1 accent-terra"
                />
                <span className="text-sm text-brown/85 leading-snug">
                  I confirm she gave consent for her story to be shared.
                </span>
              </label>

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
                <Button type="submit" disabled={submitting || !consent} className="bg-terra">
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
