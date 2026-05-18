"use client";

import { useEffect, useState } from "react";
import SlideOver from "@/components/admin/SlideOver";
import { FormGrid, Field, TagPicker, inputClass } from "@/components/admin/FormPrimitives";
import Button from "@/components/ui/Button";
import {
  fetchContent,
  saveContent,
  removeContent,
  toggleContentPublished,
} from "@/server/actions/content";
import type { ContentType, ReviewStatus } from "@/lib/types/database";
import type { ContentWithTranslations as Content } from "@/lib/types/models";

type Lang = "en" | "zu" | "xh" | "af";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zu", label: "isiZulu" },
  { code: "xh", label: "isiXhosa" },
  { code: "af", label: "Afrikaans" },
];

type DraftTranslation = {
  title: string;
  description: string;
  url: string;
  review_status: ReviewStatus;
};

type Draft = {
  type: ContentType;
  symptom_tags: string[];
  persona_tags: string[];
  published: boolean;
  translations: Record<Lang, DraftTranslation>;
};

const SYMPTOM_TAGS = [
  "mind-cognition","mood","nervous-system","body","urogenital","other","quality-of-life",
];
const PERSONA_TAGS = ["sally","olga","vicky","nelly","nina","retha","colleen"];

const REVIEW_STYLE: Record<ReviewStatus, string> = {
  approved:  "bg-coral/25 text-terra",
  in_review: "bg-golden/30 text-brown",
  draft:     "bg-brown/10 text-brown/55",
};

const emptyTranslation = (): DraftTranslation => ({
  title: "",
  description: "",
  url: "",
  review_status: "draft",
});

const emptyDraft = (): Draft => ({
  type: "article",
  symptom_tags: [],
  persona_tags: [],
  published: false,
  translations: {
    en: emptyTranslation(),
    zu: emptyTranslation(),
    xh: emptyTranslation(),
    af: emptyTranslation(),
  },
});

const titleOf = (c: Content): string => {
  const tr = c.content_translations ?? [];
  return (
    tr.find((t) => t.language_code === "en")?.title ||
    tr[0]?.title ||
    "(untitled)"
  );
};

export default function AdminContentPage() {
  const [items, setItems] = useState<Content[] | null>(null);
  const [editing, setEditing] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [activeLang, setActiveLang] = useState<Lang>("en");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setItems(await fetchContent());
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setActiveLang("en");
    setOpen(true);
  };

  const openEdit = (c: Content) => {
    setEditing(c);
    const next = emptyDraft();
    next.type = c.type ?? "article";
    next.symptom_tags = c.symptom_tags ?? [];
    next.persona_tags = c.persona_tags ?? [];
    next.published = c.published;
    for (const { code } of LANGS) {
      const tr = (c.content_translations ?? []).find((t) => t.language_code === code);
      if (tr) {
        next.translations[code] = {
          title: tr.title ?? "",
          description: tr.description ?? "",
          url: tr.url ?? "",
          review_status: tr.review_status ?? "draft",
        };
      }
    }
    setDraft(next);
    setActiveLang("en");
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    await saveContent({
      id: editing?.id ?? null,
      type: draft.type,
      symptom_tags: draft.symptom_tags,
      persona_tags: draft.persona_tags,
      published: draft.published,
      translations: LANGS.map(({ code }) => {
        const tr = draft.translations[code];
        const existing = (editing?.content_translations ?? []).find(
          (t) => t.language_code === code,
        );
        return {
          language_code: code,
          title: tr.title,
          description: tr.description,
          url: tr.url,
          review_status: tr.review_status,
          existingId: existing?.id ?? null,
        };
      }),
    });
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this content item and all its translations? This cannot be undone.")) return;
    await removeContent(id);
    await load();
  };

  const togglePublished = async (c: Content) => {
    await toggleContentPublished(c.id, !c.published);
    await load();
  };

  const activeTr = draft.translations[activeLang];
  const setActiveTr = (patch: Partial<DraftTranslation>) =>
    setDraft({
      ...draft,
      translations: { ...draft.translations, [activeLang]: { ...activeTr, ...patch } },
    });

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Library</p>
          <h1 className="font-display text-4xl text-brown">Content</h1>
          <p className="text-brown/65 mt-2">Articles, videos, podcasts — one item, translated into every language.</p>
        </div>
        <Button onClick={openNew} size="md">+ Add content</Button>
      </header>

      <div className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden">
        {items === null ? (
          <p className="px-6 py-10 text-sm text-brown/50">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-sm text-brown/50">No content yet. Add your first item.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-deep/40 text-brown/60 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Title</th>
                <th className="text-left px-5 py-3 font-semibold">Type</th>
                <th className="text-left px-5 py-3 font-semibold">Languages</th>
                <th className="text-left px-5 py-3 font-semibold">Tags</th>
                <th className="text-left px-5 py-3 font-semibold">Published</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-cream-deep/40 hover:bg-cream">
                  <td className="px-5 py-4 font-medium text-brown">{titleOf(c)}</td>
                  <td className="px-5 py-4 text-brown/70 capitalize">{c.type ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(c.content_translations ?? []).length === 0 ? (
                        <span className="text-xs text-brown/40">—</span>
                      ) : (
                        LANGS.map(({ code }) => {
                          const tr = (c.content_translations ?? []).find((t) => t.language_code === code);
                          if (!tr) return null;
                          return (
                            <span
                              key={code}
                              title={tr.review_status}
                              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${REVIEW_STYLE[tr.review_status]}`}
                            >
                              {code}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-brown/60">
                    <div className="flex flex-wrap gap-1">
                      {(c.symptom_tags ?? []).slice(0, 2).map((t) => (
                        <span key={t} className="bg-brown/5 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                      {(c.persona_tags ?? []).slice(0, 2).map((t) => (
                        <span key={t} className="bg-golden/20 text-brown px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => togglePublished(c)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold
                        ${c.published
                          ? "bg-coral/25 text-terra"
                          : "bg-brown/10 text-brown/60"}`}
                    >
                      {c.published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-xs text-terra font-semibold hover:text-brown mr-3">
                      Edit
                    </button>
                    <button onClick={() => remove(c.id)} className="text-xs text-brown/60 hover:text-terra">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit content" : "Add content"}
        width="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setOpen(false)} className="text-sm text-brown/60 font-medium px-4 py-2">Cancel</button>
            <Button onClick={save} disabled={!draft.translations.en.title.trim() || saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </div>
        }
      >
        <FormGrid>
          <Field label="Type">
            <select
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value as ContentType })}
              className={inputClass}
            >
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
            </select>
          </Field>
          <Field label="Published">
            <label className="inline-flex items-center gap-3 cursor-pointer h-[42px]">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft({ ...draft, published: e.target.checked })}
                className="w-5 h-5 accent-terra"
              />
              <span className="text-sm text-brown/80">Visible on the public site</span>
            </label>
          </Field>
          <Field label="Symptom tags" full>
            <TagPicker
              options={SYMPTOM_TAGS}
              selected={draft.symptom_tags}
              onChange={(v) => setDraft({ ...draft, symptom_tags: v })}
            />
          </Field>
          <Field label="Persona tags" full>
            <TagPicker
              options={PERSONA_TAGS}
              selected={draft.persona_tags}
              onChange={(v) => setDraft({ ...draft, persona_tags: v })}
            />
          </Field>
        </FormGrid>

        {/* Per-language translation editor */}
        <div className="mt-7 pt-6 border-t border-cream-deep/50">
          <p className="text-[11px] uppercase tracking-[0.18em] text-brown/55 font-semibold mb-3">
            Translations
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {LANGS.map(({ code, label }) => {
              const filled = draft.translations[code].title.trim().length > 0;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveLang(code)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-colors
                    ${activeLang === code
                      ? "bg-brown text-cream border-brown"
                      : "bg-transparent border-cream-deep text-brown/70 hover:border-terra"}`}
                >
                  {label}
                  {filled && (
                    <span className={`ml-1.5 ${activeLang === code ? "text-golden" : "text-terra"}`}>•</span>
                  )}
                </button>
              );
            })}
          </div>

          <FormGrid>
            <Field label={`Title (${activeLang})`} full>
              <input
                value={activeTr.title}
                onChange={(e) => setActiveTr({ title: e.target.value })}
                className={inputClass}
                placeholder={activeLang === "en" ? "Required" : "Leave blank if not yet translated"}
              />
            </Field>
            <Field label="URL" full>
              <input
                value={activeTr.url}
                onChange={(e) => setActiveTr({ url: e.target.value })}
                className={inputClass}
                placeholder="https://…"
              />
            </Field>
            <Field label="Description" full>
              <textarea
                rows={3}
                value={activeTr.description}
                onChange={(e) => setActiveTr({ description: e.target.value })}
                className={`${inputClass} resize-none`}
              />
            </Field>
            <Field label="Review status" full>
              <select
                value={activeTr.review_status}
                onChange={(e) => setActiveTr({ review_status: e.target.value as ReviewStatus })}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="in_review">In review</option>
                <option value="approved">Approved — visible to public</option>
              </select>
            </Field>
          </FormGrid>
          <p className="text-xs text-brown/50 mt-3 leading-relaxed">
            A translation appears on the public site only when the item is Published
            <span className="mx-1">and</span> that language is marked Approved.
          </p>
        </div>
      </SlideOver>
    </div>
  );
}
