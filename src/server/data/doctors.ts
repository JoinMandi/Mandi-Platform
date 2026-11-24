/** Data access — doctor_profiles + S3 photo storage. */
import type { Db } from "@/server/db/pool";
import { all, one, run } from "@/server/db/sql";
import { putPublicImage } from "@/server/storage";
import type { DoctorRow } from "@/lib/types/database";

export type DoctorInput = Omit<DoctorRow, "id" | "created_at" | "updated_at">;

export async function listDoctors(db: Db): Promise<DoctorRow[]> {
  return all<DoctorRow>(db, `select * from web.doctor_profiles order by name asc`);
}

export async function insertDoctor(db: Db, input: DoctorInput): Promise<void> {
  await run(
    db,
    `insert into web.doctor_profiles
       (name, practice, photo_url, bio, languages, booking_url, published)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [
      input.name,
      input.practice,
      input.photo_url,
      input.bio,
      input.languages,
      input.booking_url,
      input.published,
    ],
  );
}

export async function updateDoctor(
  db: Db,
  id: string,
  input: DoctorInput,
): Promise<void> {
  await run(
    db,
    `update web.doctor_profiles set
       name = $2, practice = $3, photo_url = $4, bio = $5,
       languages = $6, booking_url = $7, published = $8
     where id = $1`,
    [
      id,
      input.name,
      input.practice,
      input.photo_url,
      input.bio,
      input.languages,
      input.booking_url,
      input.published,
    ],
  );
}

export async function deleteDoctor(db: Db, id: string): Promise<void> {
  await run(db, `delete from web.doctor_profiles where id = $1`, [id]);
}

export async function listPublicDoctors(db: Db): Promise<DoctorRow[]> {
  return all<DoctorRow>(
    db,
    `select * from web.doctor_profiles where published order by name asc`,
  );
}

export async function getPublicDoctorById(
  db: Db,
  id: string,
): Promise<DoctorRow | null> {
  return one<DoctorRow>(
    db,
    `select * from web.doctor_profiles where id = $1 and published`,
    [id],
  );
}

/** Uploads a photo to S3 and returns the app-relative URL. */
export async function uploadDoctorPhoto(file: File): Promise<string | null> {
  try {
    return await putPublicImage(file, "doctor-photos");
  } catch (error) {
    console.error("[doctors] photo upload failed", error);
    return null;
  }
}
