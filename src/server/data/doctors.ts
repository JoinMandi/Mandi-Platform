/** Data access — doctor_profiles + doctor-photos storage bucket. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DoctorRow } from "@/lib/types/database";

export type DoctorInput = Omit<DoctorRow, "id" | "created_at" | "updated_at">;

export async function listDoctors(db: SupabaseClient): Promise<DoctorRow[]> {
  const { data } = await db
    .from("doctor_profiles")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as DoctorRow[];
}

export async function insertDoctor(db: SupabaseClient, input: DoctorInput): Promise<void> {
  await db.from("doctor_profiles").insert(input);
}

export async function updateDoctor(
  db: SupabaseClient,
  id: string,
  input: DoctorInput,
): Promise<void> {
  await db.from("doctor_profiles").update(input).eq("id", id);
}

export async function deleteDoctor(db: SupabaseClient, id: string): Promise<void> {
  await db.from("doctor_profiles").delete().eq("id", id);
}

/** Phase 23: published doctors for the public /find-a-doctor page. RLS
 *  `doctor_read_published` already gates this for anonymous readers. */
export async function listPublicDoctors(db: SupabaseClient): Promise<DoctorRow[]> {
  const { data } = await db
    .from("doctor_profiles")
    .select("*")
    .eq("published", true)
    .order("name", { ascending: true });
  return (data ?? []) as DoctorRow[];
}

/** Phase 23: single published doctor for the /find-a-doctor/[id] profile.
 *  Returns null when not found or not published (RLS handles the latter). */
export async function getPublicDoctorById(
  db: SupabaseClient,
  id: string,
): Promise<DoctorRow | null> {
  const { data } = await db
    .from("doctor_profiles")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  return (data as DoctorRow | null) ?? null;
}

/** Uploads a photo to the `doctor-photos` bucket and returns its public URL. */
export async function uploadDoctorPhoto(
  db: SupabaseClient,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await db.storage.from("doctor-photos").upload(key, file);
  if (error) return null;
  const { data } = db.storage.from("doctor-photos").getPublicUrl(key);
  return data.publicUrl;
}
