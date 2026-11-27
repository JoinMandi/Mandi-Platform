"use server";

import { getSessionUser } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
import {
  createConsultation,
  latestConsultationForUser,
  saveOutcome as saveOutcomeRow,
  setRecordingConsent,
  type OutcomeInput,
} from "@/server/data/consultations";
import type { ConsultationRow } from "@/lib/types/database";
import { compareResponses, type CheckinComparison } from "@/lib/domain/checkin";

export type { CheckinComparison };
import { insertCheckin } from "@/server/data/checkins";
import { recentResponsesForUser } from "@/server/data/questionnaire";

export async function bookConsultation(args: {
  doctorName: string;
  appointmentAt?: string | null;
}): Promise<{ ok: true; id?: string; demo?: boolean } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: true, demo: true };
  }
  try {
    const row = await withUser({ id: user.id, role: user.role }, (db) =>
      createConsultation(db, {
        user_id: user.id,
        doctor_name: args.doctorName,
        appointment_at: args.appointmentAt ?? null,
        recording_consent: true,
      }),
    );
    return row ? { ok: true, id: row.id } : { ok: false, error: "Could not book. Please try again." };
  } catch {
    return { ok: false, error: "Could not book. Please try again." };
  }
}

export async function recordConsent(consultationId: string): Promise<{ ok: boolean }> {
  const user = await getSessionUser();
  if (!user) return { ok: false };
  try {
    const row = await withUser({ id: user.id, role: user.role }, (db) =>
      setRecordingConsent(db, consultationId, true),
    );
    return { ok: !!row };
  } catch {
    return { ok: false };
  }
}

export async function fetchLatestConsultation(): Promise<ConsultationRow | null> {
  const user = await getSessionUser();
  if (!user) return null;
  try {
    return await withUser({ id: user.id, role: user.role }, (db) =>
      latestConsultationForUser(db, user.id),
    );
  } catch {
    return null;
  }
}

export async function saveOutcome(
  input: OutcomeInput,
): Promise<{ ok: true; demo?: boolean } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) return { ok: true, demo: true };
  try {
    const result = await withUser({ id: user.id, role: user.role }, async (db) => {
      const latest = await latestConsultationForUser(db, user.id);
      if (!latest) return null;
      return saveOutcomeRow(db, latest.id, input);
    });
    return result ? { ok: true } : { ok: false, error: "No consultation found to attach this to." };
  } catch {
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function submitCheckin(args: {
  type: "6week" | "4month";
  answers?: Record<string, number>;
  openResponse?: string;
}): Promise<{ ok: true; demo?: boolean } | { ok: false; error: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: true, demo: true };
  }
  try {
    const row = await withUser({ id: user.id, role: user.role }, (db) =>
      insertCheckin(db, {
        user_id: user.id,
        type: args.type,
        action_taken: args.answers ? JSON.stringify(args.answers) : null,
        open_response: args.openResponse ?? null,
      }),
    );
    return row ? { ok: true } : { ok: false, error: "Could not save. Please try again." };
  } catch {
    return { ok: false, error: "Could not save. Please try again." };
  }
}

export async function fetchCheckinComparison(): Promise<CheckinComparison | null> {
  const user = await getSessionUser();
  if (!user) return null;
  try {
    return await withUser({ id: user.id, role: user.role }, async (db) => {
      const rows = await recentResponsesForUser(db, user.id, 2);
      if (rows.length === 0) return null;
      const latest = rows[0];
      const previous = rows[1] ?? null;
      return compareResponses(previous, latest);
    });
  } catch {
    return null;
  }
}
