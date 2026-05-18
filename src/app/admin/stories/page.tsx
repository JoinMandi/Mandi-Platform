"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchStories, updateStoryStatus } from "@/server/actions/stories";
import type { StoryRow as Story, StoryStatus } from "@/lib/types/database";

const STATUS_LABEL: Record<StoryStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<StoryStatus, string> = {
  pending:  "bg-golden/25 text-brown",
  approved: "bg-coral/25 text-terra",
  rejected: "bg-brown/10 text-brown/60",
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [status, setStatus] = useState<"all" | StoryStatus>("pending");
  const [lang, setLang] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setStories(await fetchStories());
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (!stories) return null;
    return stories.filter(
      (s) =>
        (status === "all" || s.status === status) &&
        (lang === "all" || s.language_code === lang),
    );
  }, [stories, status, lang]);

  const setRowStatus = async (id: string, next: StoryStatus) => {
    await updateStoryStatus(id, next);
    await load();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <Header />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterPills value={status} onChange={(v) => setStatus(v as "all" | StoryStatus)}
          options={[["all","All"],["pending","Pending"],["approved","Approved"],["rejected","Rejected"]]} />
        <FilterPills value={lang} onChange={setLang}
          options={[["all","All languages"],["en","English"],["zu","isiZulu"],["xh","isiXhosa"],["af","Afrikaans"]]} />
      </div>

      {/* Table */}
      <div className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden">
        {filtered === null ? (
          <p className="px-6 py-10 text-sm text-brown/50">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-10 text-sm text-brown/50">No stories match.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-deep/40 text-brown/60 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Submitted</th>
                <th className="text-left px-5 py-3 font-semibold">Author</th>
                <th className="text-left px-5 py-3 font-semibold">Lang</th>
                <th className="text-left px-5 py-3 font-semibold">Tags</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <StoryRow
                  key={s.id}
                  story={s}
                  expanded={expanded === s.id}
                  onExpand={() => setExpanded(expanded === s.id ? null : s.id)}
                  onApprove={() => setRowStatus(s.id, "approved")}
                  onReject={() => setRowStatus(s.id, "rejected")}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Moderation</p>
      <h1 className="font-display text-4xl text-brown">Stories</h1>
      <p className="text-brown/65 mt-2 max-w-xl">
        Women who chose to share. Approve with care; reject only when necessary. Every published story must have
        explicit consent.
      </p>
    </header>
  );
}

function FilterPills({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors border
            ${value === v
              ? "bg-brown text-cream border-brown"
              : "bg-cream-soft border-cream-deep text-brown/70 hover:border-terra hover:text-terra"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StoryRow({
  story,
  expanded,
  onExpand,
  onApprove,
  onReject,
}: {
  story: Story;
  expanded: boolean;
  onExpand: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const date = new Date(story.created_at).toLocaleDateString();
  return (
    <>
      <tr className="border-t border-cream-deep/40 hover:bg-cream">
        <td className="px-5 py-4 text-brown/70">{date}</td>
        <td className="px-5 py-4 font-medium text-brown">{story.author_name || "Anonymous"}</td>
        <td className="px-5 py-4 text-brown/60 uppercase">{story.language_code ?? "—"}</td>
        <td className="px-5 py-4 text-brown/60">
          <div className="flex gap-1.5 flex-wrap">
            {(story.symptom_tags ?? []).slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] bg-brown/5 border border-brown/10 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </td>
        <td className="px-5 py-4">
          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLE[story.status]}`}>
            {STATUS_LABEL[story.status]}
          </span>
        </td>
        <td className="px-5 py-4 text-right whitespace-nowrap">
          <button
            onClick={onExpand}
            className="text-xs text-terra font-semibold hover:text-brown mr-4"
          >
            {expanded ? "Hide" : "Read"}
          </button>
          <button
            onClick={onApprove}
            disabled={story.status === "approved"}
            className="text-xs bg-coral/20 text-terra font-semibold px-3 py-1.5 rounded-full hover:bg-coral/30 disabled:opacity-40"
          >
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={story.status === "rejected"}
            className="text-xs bg-brown/10 text-brown/70 font-semibold px-3 py-1.5 rounded-full hover:bg-brown/20 ml-2 disabled:opacity-40"
          >
            Reject
          </button>
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
                className="max-w-3xl"
              >
                <p className="text-brown/80 text-sm leading-relaxed italic whitespace-pre-wrap">
                  &ldquo;{story.content}&rdquo;
                </p>
                {!story.consent && (
                  <p className="mt-3 text-xs text-terra font-semibold">
                    ⚠ Consent checkbox not ticked — do not publish.
                  </p>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
