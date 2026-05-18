/** Data access — clinic_directory. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClinicRow } from "@/lib/types/database";

export type ClinicInput = Omit<ClinicRow, "id" | "created_at" | "updated_at">;

export async function listClinics(db: SupabaseClient): Promise<ClinicRow[]> {
  const { data } = await db
    .from("clinic_directory")
    .select("*")
    .order("name", { ascending: true });
  return (data ?? []) as ClinicRow[];
}

export async function insertClinic(db: SupabaseClient, input: ClinicInput): Promise<void> {
  await db.from("clinic_directory").insert(input);
}

export async function updateClinic(
  db: SupabaseClient,
  id: string,
  input: ClinicInput,
): Promise<void> {
  await db.from("clinic_directory").update(input).eq("id", id);
}

export async function deleteClinic(db: SupabaseClient, id: string): Promise<void> {
  await db.from("clinic_directory").delete().eq("id", id);
}

export async function setClinicPublished(
  db: SupabaseClient,
  id: string,
  published: boolean,
): Promise<void> {
  await db.from("clinic_directory").update({ published }).eq("id", id);
}

export async function countPublishedClinics(db: SupabaseClient): Promise<number> {
  const { count } = await db
    .from("clinic_directory")
    .select("id", { count: "exact", head: true })
    .eq("published", true);
  return count ?? 0;
}
