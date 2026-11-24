/** Data access — clinic_directory. */
import type { Db } from "@/server/db/pool";
import { all, count, run } from "@/server/db/sql";
import type { ClinicRow } from "@/lib/types/database";

export type ClinicInput = Omit<ClinicRow, "id" | "created_at" | "updated_at">;

export async function listClinics(db: Db): Promise<ClinicRow[]> {
  return all<ClinicRow>(db, `select * from web.clinic_directory order by name asc`);
}

export async function insertClinic(db: Db, input: ClinicInput): Promise<void> {
  await run(
    db,
    `insert into web.clinic_directory
       (name, practice, province, languages, format, contact, booking_url,
        hrt_friendly, published)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      input.name,
      input.practice,
      input.province,
      input.languages,
      input.format,
      input.contact,
      input.booking_url,
      input.hrt_friendly,
      input.published,
    ],
  );
}

export async function updateClinic(
  db: Db,
  id: string,
  input: ClinicInput,
): Promise<void> {
  await run(
    db,
    `update web.clinic_directory set
       name = $2, practice = $3, province = $4, languages = $5, format = $6,
       contact = $7, booking_url = $8, hrt_friendly = $9, published = $10
     where id = $1`,
    [
      id,
      input.name,
      input.practice,
      input.province,
      input.languages,
      input.format,
      input.contact,
      input.booking_url,
      input.hrt_friendly,
      input.published,
    ],
  );
}

export async function deleteClinic(db: Db, id: string): Promise<void> {
  await run(db, `delete from web.clinic_directory where id = $1`, [id]);
}

export async function setClinicPublished(
  db: Db,
  id: string,
  published: boolean,
): Promise<void> {
  await run(db, `update web.clinic_directory set published = $2 where id = $1`, [
    id,
    published,
  ]);
}

export async function countPublishedClinics(db: Db): Promise<number> {
  return count(
    db,
    `select count(*)::int as n from web.clinic_directory where published`,
  );
}

/** Published clinics for the public /find-a-doctor page (RLS also gates). */
export async function listPublicClinics(db: Db): Promise<ClinicRow[]> {
  return all<ClinicRow>(
    db,
    `select * from web.clinic_directory where published order by name asc`,
  );
}
