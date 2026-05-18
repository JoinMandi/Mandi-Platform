"use server";

import { createActionClient } from "@/server/supabase/server";
import { getSessionUser, requireAdmin } from "@/server/auth";
import { getUserRole } from "@/server/data/users";
import { countPendingStories } from "@/server/data/stories";
import { countPendingEvents } from "@/server/data/events";
import { countUsers } from "@/server/data/users";
import { countPublishedClinics } from "@/server/data/clinics";
import { countResponses } from "@/server/data/questionnaire";
import type { UserRole } from "@/lib/types/database";

/** Role + moderation badge counts for the admin shell. Returns role so the
 *  shell can render its access gate; counts are 0 for non-admins. */
export async function fetchAdminContext(): Promise<{
  role: UserRole | null;
  email: string | null;
  pendingStories: number;
  pendingEvents: number;
}> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return { role: null, email: null, pendingStories: 0, pendingEvents: 0 };
  const role = await getUserRole(db, user.id);
  if (role !== "admin") {
    return { role, email: user.email ?? null, pendingStories: 0, pendingEvents: 0 };
  }
  const [pendingStories, pendingEvents] = await Promise.all([
    countPendingStories(db),
    countPendingEvents(db),
  ]);
  return { role, email: user.email ?? null, pendingStories, pendingEvents };
}

export async function fetchDashboardStats(): Promise<{
  pendingStories: number;
  pendingEvents: number;
  totalUsers: number;
  publishedClinics: number;
  totalResponses: number;
}> {
  const db = createActionClient();
  await requireAdmin(db);
  const [pendingStories, pendingEvents, totalUsers, publishedClinics, totalResponses] =
    await Promise.all([
      countPendingStories(db),
      countPendingEvents(db),
      countUsers(db),
      countPublishedClinics(db),
      countResponses(db),
    ]);
  return { pendingStories, pendingEvents, totalUsers, publishedClinics, totalResponses };
}
