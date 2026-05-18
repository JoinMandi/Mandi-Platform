"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { requireAdmin } from "@/server/auth";
import {
  listDoctors,
  insertDoctor,
  updateDoctor,
  deleteDoctor,
  uploadDoctorPhoto,
  type DoctorInput,
} from "@/server/data/doctors";
import type { DoctorRow } from "@/lib/types/database";

export async function fetchDoctors(): Promise<DoctorRow[]> {
  const db = createActionClient();
  await requireAdmin(db);
  return listDoctors(db);
}

export async function saveDoctor(
  id: string | null,
  input: DoctorInput,
): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  if (id) await updateDoctor(db, id, input);
  else await insertDoctor(db, input);
  revalidatePath("/admin/doctors");
}

export async function removeDoctor(id: string): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  await deleteDoctor(db, id);
  revalidatePath("/admin/doctors");
}

/** Uploads a doctor photo to storage; returns its public URL. */
export async function uploadDoctorPhotoAction(file: File): Promise<string | null> {
  const db = createActionClient();
  await requireAdmin(db);
  return uploadDoctorPhoto(db, file);
}
