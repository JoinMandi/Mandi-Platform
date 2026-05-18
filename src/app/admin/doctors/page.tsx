"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SlideOver from "@/components/admin/SlideOver";
import { FormGrid, Field, TagPicker, inputClass } from "@/components/admin/FormPrimitives";
import Button from "@/components/ui/Button";
import {
  fetchDoctors,
  saveDoctor,
  removeDoctor,
  uploadDoctorPhotoAction,
} from "@/server/actions/doctors";
import type { DoctorRow as Doctor } from "@/lib/types/database";

type DoctorDraft = Omit<Doctor, "id" | "created_at" | "updated_at">;

const LANG_OPTS = ["English","Afrikaans","isiZulu","isiXhosa","Sesotho","Setswana"];

const EMPTY: DoctorDraft = {
  name: "",
  practice: "",
  photo_url: null,
  bio: "",
  languages: [],
  booking_url: "",
  published: false,
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [draft, setDraft] = useState<DoctorDraft>(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setDoctors(await fetchDoctors());
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => { setEditing(null); setDraft(EMPTY); setOpen(true); };
  const openEdit = (d: Doctor) => {
    setEditing(d);
    setDraft({
      name: d.name,
      practice: d.practice ?? "",
      photo_url: d.photo_url,
      bio: d.bio ?? "",
      languages: d.languages ?? [],
      booking_url: d.booking_url ?? "",
      published: d.published,
    });
    setOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadDoctorPhotoAction(file);
    setUploading(false);
    if (!url) {
      alert("Upload failed. Please try again.");
      return;
    }
    setDraft((d) => ({ ...d, photo_url: url }));
  };

  const save = async () => {
    setSaving(true);
    await saveDoctor(editing?.id ?? null, {
      name: draft.name.trim(),
      practice: draft.practice?.trim() || null,
      photo_url: draft.photo_url,
      bio: draft.bio?.trim() || null,
      languages: draft.languages,
      booking_url: draft.booking_url?.trim() || null,
      published: draft.published,
    });
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this doctor profile?")) return;
    await removeDoctor(id);
    await load();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Featured</p>
          <h1 className="font-display text-4xl text-brown">Doctors</h1>
          <p className="text-brown/65 mt-2">Meet-the-Doctors profiles shown on the Find a Doctor page.</p>
        </div>
        <Button onClick={openNew}>+ Add doctor</Button>
      </header>

      {doctors === null ? (
        <p className="text-sm text-brown/50">Loading…</p>
      ) : doctors.length === 0 ? (
        <p className="text-sm text-brown/50">No doctors yet. Add your first profile.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((d) => (
            <article key={d.id} className="bg-cream-soft rounded-3xl shadow-warm p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-golden via-pink-mandi to-terra mb-4 relative shadow-warm">
                {d.photo_url && (
                  <Image src={d.photo_url} alt={d.name} fill sizes="96px" className="object-cover" />
                )}
              </div>
              <h3 className="font-display text-xl text-brown">{d.name}</h3>
              <p className="text-terra text-sm font-semibold">{d.practice ?? "—"}</p>
              <div className="flex gap-1.5 flex-wrap justify-center mt-3">
                {(d.languages ?? []).map((l) => (
                  <span key={l} className="text-[11px] bg-golden/25 text-brown px-2.5 py-0.5 rounded-full font-medium">{l}</span>
                ))}
              </div>
              <p className={`mt-4 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full
                ${d.published ? "bg-coral/25 text-terra" : "bg-brown/10 text-brown/60"}`}>
                {d.published ? "Live" : "Draft"}
              </p>
              <div className="flex gap-3 mt-4 text-xs">
                <button onClick={() => openEdit(d)} className="text-terra font-semibold hover:text-brown">Edit</button>
                <button onClick={() => remove(d.id)} className="text-brown/60 hover:text-terra">Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit doctor" : "Add doctor"}
        width="lg"
        footer={
          <div className="flex gap-3 justify-end">
            <button onClick={() => setOpen(false)} className="text-sm text-brown/60 font-medium px-4 py-2">Cancel</button>
            <Button onClick={save} disabled={!draft.name.trim() || saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Photo uploader */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-golden via-pink-mandi to-terra relative flex-shrink-0">
              {draft.photo_url && (
                <Image src={draft.photo_url} alt="" fill sizes="80px" className="object-cover" />
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-brown/55 font-semibold mb-2">Photo</p>
              <input ref={fileInput} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="bg-cream border-2 border-terra text-terra text-xs font-semibold px-4 py-2 rounded-full hover:bg-terra hover:text-cream transition-colors disabled:opacity-50"
              >
                {uploading ? "Uploading…" : draft.photo_url ? "Replace photo" : "Upload photo"}
              </button>
              {draft.photo_url && (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, photo_url: null })}
                  className="ml-2 text-xs text-brown/60 hover:text-terra"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <FormGrid>
            <Field label="Name" full>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Practice" full>
              <input value={draft.practice ?? ""} onChange={(e) => setDraft({ ...draft, practice: e.target.value })} className={inputClass} placeholder="e.g. Integrative Medicine" />
            </Field>
            <Field label="Booking URL" full>
              <input value={draft.booking_url ?? ""} onChange={(e) => setDraft({ ...draft, booking_url: e.target.value })} className={inputClass} placeholder="https://…" />
            </Field>
            <Field label="Languages" full>
              <TagPicker options={LANG_OPTS} selected={draft.languages ?? []} onChange={(v) => setDraft({ ...draft, languages: v })} />
            </Field>
            <Field label="Bio" full>
              <textarea
                rows={5}
                value={draft.bio ?? ""}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className={`${inputClass} resize-none`}
                placeholder="Written warm and human — not a CV."
              />
            </Field>
            <Field label="Published" full>
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} className="w-5 h-5 accent-terra" />
                <span className="text-sm text-brown/80">Show on the Find a Doctor page</span>
              </label>
            </Field>
          </FormGrid>
        </div>
      </SlideOver>
    </div>
  );
}
