"use server";

import { createActionClient } from "@/server/supabase/server";
import { getSessionUser } from "@/server/auth";
import { seedUser } from "@/server/data/users";

/**
 * Seeds the `public.users` row for the signed-in account. Called after sign-up.
 * No-ops if there is no session yet (e.g. the email-confirmation flow).
 */
export async function seedUserProfile(languageCode: string | null): Promise<void> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return;
  await seedUser(db, {
    id: user.id,
    email: user.email ?? null,
    language_code: languageCode,
  });
}
