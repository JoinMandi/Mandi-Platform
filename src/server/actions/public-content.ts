"use server";

import { listPublicEvents } from "@/server/data/events";
import { listPublicClinics } from "@/server/data/clinics";
import { getPublicDoctorById, listPublicDoctors } from "@/server/data/doctors";
import { withAnon } from "@/server/db/withUser";
import type { ClinicRow, DoctorRow } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

/** Public reads. RLS is the boundary: anonymous sees published rows only. */

export async function fetchPublicEvents(): Promise<EventWithTranslations[]> {
  return withAnon((db) => listPublicEvents(db));
}

export async function fetchFindADoctor(): Promise<{
  clinics: ClinicRow[];
  doctors: DoctorRow[];
}> {
  return withAnon(async (db) => {
    const clinics = await listPublicClinics(db);
    const doctors = await listPublicDoctors(db);
    return { clinics, doctors };
  });
}

export async function fetchDoctorProfile(id: string): Promise<DoctorRow | null> {
  return withAnon((db) => getPublicDoctorById(db, id));
}
