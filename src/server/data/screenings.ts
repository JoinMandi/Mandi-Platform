/** Data access — clinical_screenings (MenoScreen by Mandi). */
import type { Db } from "@/server/db/pool";
import { all, run } from "@/server/db/sql";
import type { ClinicalScreeningRow } from "@/lib/types/database";

export type ClinicalScreeningInput = Omit<
  ClinicalScreeningRow,
  "id" | "created_at" | "updated_at"
>;

export async function listScreeningsForClinician(
  db: Db,
  clinicianId: string,
): Promise<ClinicalScreeningRow[]> {
  return all<ClinicalScreeningRow>(
    db,
    `select * from care.clinical_screenings
     where clinician_id = $1
     order by created_at desc`,
    [clinicianId],
  );
}

export async function insertScreening(
  db: Db,
  input: ClinicalScreeningInput,
): Promise<void> {
  await run(
    db,
    `insert into care.clinical_screenings
       (clinician_id, patient_reference, language_code, answers, score,
        risk_band, referral_recommended, clinician_notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      input.clinician_id,
      input.patient_reference,
      input.language_code,
      input.answers,
      input.score,
      input.risk_band,
      input.referral_recommended,
      input.clinician_notes,
    ],
  );
}
