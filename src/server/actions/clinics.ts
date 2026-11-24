"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
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
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listClinics(db));
}

export async function saveClinic(
  id: string | null,
  input: ClinicInput,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, async (db) => {
    if (id) await updateClinic(db, id, input);
    else await insertClinic(db, input);
  });
  revalidatePath("/admin/clinics");
}

export async function removeClinic(id: string): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) => deleteClinic(db, id));
  revalidatePath("/admin/clinics");
}

export async function toggleClinicPublished(
  id: string,
  published: boolean,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) =>
    setClinicPublished(db, id, published),
  );
  revalidatePath("/admin/clinics");
}
