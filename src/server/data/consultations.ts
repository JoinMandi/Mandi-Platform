import type { Db } from "@/server/db/pool";
import { all, one } from "@/server/db/sql";
import type { ConsultationRow } from "@/lib/types/database";

export type { ConsultationRow };

export async function createConsultation(
  db: Db,
  input: {
    user_id: string;
    doctor_name: string;
    appointment_at: string | null;
    recording_consent: boolean;
    intake?: unknown;
  },
): Promise<ConsultationRow | null> {
  return one<ConsultationRow>(
    db,
    `insert into care.consultations
       (user_id, doctor_name, appointment_at, recording_consent, intake)
     values ($1,$2,$3,$4,$5::jsonb)
     returning *`,
    [
      input.user_id,
      input.doctor_name,
      input.appointment_at,
      input.recording_consent,
      input.intake ? JSON.stringify(input.intake) : null,
    ],
  );
}

export async function listConsultationsForUser(
  db: Db,
  userId: string,
): Promise<ConsultationRow[]> {
  return all<ConsultationRow>(
    db,
    `select * from care.consultations
     where user_id = $1
     order by created_at desc`,
    [userId],
  );
}

export async function latestConsultationForUser(
  db: Db,
  userId: string,
): Promise<ConsultationRow | null> {
  return one<ConsultationRow>(
    db,
    `select * from care.consultations
     where user_id = $1
     order by created_at desc
     limit 1`,
    [userId],
  );
}

export async function setRecordingConsent(
  db: Db,
  consultationId: string,
  consent: boolean,
): Promise<ConsultationRow | null> {
  return one<ConsultationRow>(
    db,
    `update care.consultations
     set recording_consent = $2
     where id = $1
     returning *`,
    [consultationId, consent],
  );
}

export interface OutcomeInput {
  attended: string | null;
  read_summary: string | null;
  changed: string[] | null;
  treatment: unknown;
  referral: string | null;
  follow_up_at: string | null;
  fee_cents: number | null;
  usefulness: number | null;
}

export async function saveOutcome(
  db: Db,
  consultationId: string,
  input: OutcomeInput,
): Promise<ConsultationRow | null> {
  return one<ConsultationRow>(
    db,
    `update care.consultations
     set attended = $2,
         read_summary = $3,
         changed = $4,
         treatment = $5::jsonb,
         referral = $6,
         follow_up_at = $7,
         fee_cents = $8,
         usefulness = $9,
         status = 'completed',
         outcome_at = now()
     where id = $1
     returning *`,
    [
      consultationId,
      input.attended,
      input.read_summary,
      input.changed,
      input.treatment ? JSON.stringify(input.treatment) : null,
      input.referral,
      input.follow_up_at,
      input.fee_cents,
      input.usefulness,
    ],
  );
}
