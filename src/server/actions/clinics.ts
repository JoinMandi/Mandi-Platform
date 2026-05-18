"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { requireAdmin } from "@/server/auth";
import {
  listClinics,
  insertClinic,
  updateClinic,
  deleteClinic,
  setClinicPublished,
  type ClinicInput,
} from "@/server/data/clinics";
import type { ClinicRow } from "@/lib/types/database";

export async function fetchClinics(): Promise<ClinicRow[]> {
  const db = createActionClient();
  await requireAdmin(db);
  return listClinics(db);
}

export async function saveClinic(
  id: string | null,
  input: ClinicInput,
): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  if (id) await updateClinic(db, id, input);
  else await insertClinic(db, input);
  revalidatePath("/admin/clinics");
}

export async function removeClinic(id: string): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  await deleteClinic(db, id);
  revalidatePath("/admin/clinics");
}

export async function toggleClinicPublished(
  id: string,
  published: boolean,
): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  await setClinicPublished(db, id, published);
  revalidatePath("/admin/clinics");
}
