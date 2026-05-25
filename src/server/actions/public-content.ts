"use server";

/**
 * Phase 23 — public-facing reads for /events, /find-a-doctor, and the
 * /find-a-doctor/[id] profile page.
 *
 * Deliberately separate from the admin-gated `events.ts` / `clinics.ts` /
 * `doctors.ts` action files — these actions have **no auth gate**. RLS
 * is the security boundary: the underlying `*_read_published` policies
 * permit anonymous SELECT on published rows only. There is no way to
 * surface a draft or unpublished row through here.
 *
 * Lives in src/server/actions/ per CLAUDE.md (mutations + orchestration
 * layer); calls only into src/server/data/ (the sole DB-touching layer).
 */

import { createActionClient } from "@/server/supabase/server";
import { listPublicEvents } from "@/server/data/events";
import { listPublicClinics } from "@/server/data/clinics";
import {
  getPublicDoctorById,
  listPublicDoctors,
} from "@/server/data/doctors";
import type { ClinicRow, DoctorRow } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

export async function fetchPublicEvents(): Promise<EventWithTranslations[]> {
  const db = createActionClient();
  return listPublicEvents(db);
}

export async function fetchFindADoctor(): Promise<{
  clinics: ClinicRow[];
  doctors: DoctorRow[];
}> {
  const db = createActionClient();
  // One round-trip per resource — Supabase has no native multi-table
  // batch. They run in parallel so the page-paint cost is the slower
  // of the two queries, not the sum.
  const [clinics, doctors] = await Promise.all([
    listPublicClinics(db),
    listPublicDoctors(db),
  ]);
  return { clinics, doctors };
}

export async function fetchDoctorProfile(id: string): Promise<DoctorRow | null> {
  const db = createActionClient();
  return getPublicDoctorById(db, id);
}
