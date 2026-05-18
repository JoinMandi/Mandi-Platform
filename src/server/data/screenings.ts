/** Data access — clinical_screenings (MenoScreen by Mandi).
 *  The clinician-facing UI is a separate feature build; these functions give
 *  it a ready data layer. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClinicalScreeningRow } from "@/lib/types/database";

export type ClinicalScreeningInput = Omit<
  ClinicalScreeningRow,
  "id" | "created_at" | "updated_at"
>;

export async function listScreeningsForClinician(
  db: SupabaseClient,
  clinicianId: string,
): Promise<ClinicalScreeningRow[]> {
  const { data } = await db
    .from("clinical_screenings")
    .select("*")
    .eq("clinician_id", clinicianId)
    .order("created_at", { ascending: false });
  return (data ?? []) as ClinicalScreeningRow[];
}

export async function insertScreening(
  db: SupabaseClient,
  input: ClinicalScreeningInput,
): Promise<void> {
  await db.from("clinical_screenings").insert(input);
}
