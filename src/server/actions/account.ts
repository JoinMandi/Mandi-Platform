"use server";

import { getSessionUser } from "@/server/auth";
import { seedUser } from "@/server/data/users";
import { withUser } from "@/server/db/withUser";

/** Seeds the web.users row for the signed-in account (no-op without a session). */
export async function seedUserProfile(languageCode: string | null): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  await withUser({ id: user.id, role: user.role }, (db) =>
    seedUser(db, { id: user.id, email: user.email, language_code: languageCode }),
  );
}
