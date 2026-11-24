"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
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
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listDoctors(db));
}

export async function saveDoctor(
  id: string | null,
  input: DoctorInput,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, async (db) => {
    if (id) await updateDoctor(db, id, input);
    else await insertDoctor(db, input);
  });
  revalidatePath("/admin/doctors");
}

export async function removeDoctor(id: string): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) => deleteDoctor(db, id));
  revalidatePath("/admin/doctors");
}

export async function uploadDoctorPhotoAction(file: File): Promise<string | null> {
  await requireAdmin();
  return uploadDoctorPhoto(file);
}
