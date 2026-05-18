"use client";

import { useEffect, useState } from "react";
import SlideOver from "@/components/admin/SlideOver";
import { FormGrid, Field, TagPicker, inputClass } from "@/components/admin/FormPrimitives";
import Button from "@/components/ui/Button";
import {
  fetchClinics,
  saveClinic,
  removeClinic,
  toggleClinicPublished,
} from "@/server/actions/clinics";
import type { ClinicRow as Clinic, ClinicFormat } from "@/lib/types/database";

type ClinicDraft = Omit<Clinic, "id" | "created_at" | "updated_at">;

const PROVINCES = ["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"];
const LANG_OPTS = ["English","Afrikaans","isiZulu","isiXhosa","Sesotho","Setswana"];

const EMPTY: ClinicDraft = {
  name: "",
  practice: "",
  province: "Gauteng",
  languages: [],
  format: "both",
  contact: "",
  booking_url: "",
  hrt_friendly: true,
  published: false,
};

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[] | null>(null);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [draft, setDraft] = useState<ClinicDraft>(EMPTY);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setClinics(await fetchClinics());
  };

  useEffect(() => {
    void load();
  }, []);

  const openNew = () => { setEditing(null); setDraft(EMPTY); setOpen(true); };
  const openEdit = (c: Clinic) => {
    setEditing(c);
    setDraft({
      name: c.name,
      practice: c.practice ?? "",
      province: c.province ?? "Gauteng",
      languages: c.languages ?? [],
      format: c.format ?? "both",
      contact: c.contact ?? "",
      booking_url: c.booking_url ?? "",
      hrt_friendly: c.hrt_friendly,
      published: c.published,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    await saveClinic(editing?.id ?? null, {
      ...draft,
      name: draft.name.trim(),
      practice: draft.practice?.trim() || null,
      contact: draft.contact?.trim() || null,
      booking_url: draft.booking_url?.trim() || null,
    });
    setSaving(false);
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this clinic from the directory?")) return;
    await removeClinic(id);
    await load();
  };

  const togglePublished = async (c: Clinic) => {
    await toggleClinicPublished(c.id, !c.published);
    await load();
  };

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <header className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-terra font-semibold mb-2">Directory</p>
          <h1 className="font-display text-4xl text-brown">Clinics</h1>
          <p className="text-brown/65 mt-2">HRT-friendly practitioners across South Africa.</p>
        </div>
        <Button onClick={openNew}>+ Add clinic</Button>
      </header>

      <div className="bg-cream-soft rounded-3xl shadow-warm overflow-hidden">
        {clinics === null ? (
          <p className="px-6 py-10 text-sm text-brown/50">Loading…</p>
        ) : clinics.length === 0 ? (
          <p className="px-6 py-10 text-sm text-brown/50">No clinics yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-deep/40 text-brown/60 text-[11px] uppercase tracking-[0.15em]">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Practice</th>
                <th className="text-left px-5 py-3 font-semibold">Province</th>
                <th className="text-left px-5 py-3 font-semibold">Languages</th>
                <th className="text-left px-5 py-3 font-semibold">Format</th>
                <th className="text-left px-5 py-3 font-semibold">HRT-friendly</th>
                <th className="text-left px-5 py-3 font-semibold">Published</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clinics.map((c) => (
                <tr key={c.id} className="border-t border-cream-deep/40 hover:bg-cream">
                  <td className="px-5 py-4 font-medium text-brown">{c.name}</td>
                  <td className="px-5 py-4 text-brown/70">{c.practice ?? "—"}</td>
                  <td className="px-5 py-4 text-brown/70">{c.province ?? "—"}</td>
                  <td className="px-5 py-4 text-brown/60 text-xs">
                    {(c.languages ?? []).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-4 text-brown/70 capitalize">{c.format ?? "—"}</td>
                  <td className="px-5 py-4 text-brown/70">{c.hrt_friendly ? "Yes" : "No"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => togglePublished(c)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold
                        ${c.published ? "bg-coral/25 text-terra" : "bg-brown/10 text-brown/60"}`}>
                      {c.published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-xs text-terra font-semibold hover:text-brown mr-3">Edit</button>
                    <button onClick={() => remove(c.id)} className="text-xs text-brown/60 hover:text-terra">Delete</button>
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
        title={editing ? "Edit clinic" : "Add clinic"}
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
        <FormGrid>
          <Field label="Name" full>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Practice">
            <input value={draft.practice ?? ""} onChange={(e) => setDraft({ ...draft, practice: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Province">
            <select value={draft.province ?? "Gauteng"} onChange={(e) => setDraft({ ...draft, province: e.target.value })} className={inputClass}>
              {PROVINCES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Format">
            <select value={draft.format ?? "both"} onChange={(e) => setDraft({ ...draft, format: e.target.value as ClinicFormat })} className={inputClass}>
              <option value="both">Both</option>
              <option value="inperson">In-person</option>
              <option value="online">Online</option>
            </select>
          </Field>
          <Field label="Contact">
            <input value={draft.contact ?? ""} onChange={(e) => setDraft({ ...draft, contact: e.target.value })} className={inputClass} placeholder="Phone or email" />
          </Field>
          <Field label="Booking URL" full>
            <input value={draft.booking_url ?? ""} onChange={(e) => setDraft({ ...draft, booking_url: e.target.value })} className={inputClass} placeholder="https://…" />
          </Field>
          <Field label="Languages spoken" full>
            <TagPicker options={LANG_OPTS} selected={draft.languages ?? []} onChange={(v) => setDraft({ ...draft, languages: v })} />
          </Field>
          <Field label="HRT-friendly" full>
            <Toggle checked={draft.hrt_friendly} onChange={(v) => setDraft({ ...draft, hrt_friendly: v })} label="Known to be HRT-informed" />
          </Field>
          <Field label="Published" full>
            <Toggle checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} label="Visible on the public directory" />
          </Field>
        </FormGrid>
      </SlideOver>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-terra" />
      <span className="text-sm text-brown/80">{label}</span>
    </label>
  );
}
