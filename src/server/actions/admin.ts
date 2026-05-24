"use server";

import { createActionClient } from "@/server/supabase/server";
import { getAdminAuthStatus, requireAdmin } from "@/server/auth";
import { countPendingStories } from "@/server/data/stories";
import { countPendingEvents } from "@/server/data/events";
import { countUsers } from "@/server/data/users";
import { countPublishedClinics } from "@/server/data/clinics";
import { countResponses } from "@/server/data/questionnaire";
import type { UserRole } from "@/lib/types/database";

/** Role + auth posture + moderation badge counts for the admin shell. The
 *  shell uses `role` to render the access gate, `mfaAvailable` to decide
 *  whether to enforce AAL2 at all, and `currentLevel`/`hasFactor` to drive
 *  the /admin/security enrolment redirect when MFA is in use. */
export async function fetchAdminContext(): Promise<{
  signedIn: boolean;
  role: UserRole | null;
  /** True when role === "superadmin" — used by the UI to gate privileged-
   *  tier affordances (mint/demote admin or superadmin, invite at admin or
   *  superadmin level). */
  isSuperadmin: boolean;
  email: string | null;
  mfaAvailable: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  hasFactor: boolean;
  pendingStories: number;
  pendingEvents: number;
}> {
  const db = createActionClient();
  const status = await getAdminAuthStatus(db);
  // Admin tier = admin OR superadmin. AdminShell uses this to gate page
  // access; the moderation-badge counts are only meaningful for the
  // admin surface.
  const isAdminTier = status.role === "admin" || status.role === "superadmin";
  const isSuperadmin = status.role === "superadmin";
  if (!isAdminTier) {
    return {
      signedIn: status.signedIn,
      role: (status.role as UserRole | null) ?? null,
      isSuperadmin: false,
      email: status.email,
      mfaAvailable: status.mfaAvailable,
      currentLevel: status.currentLevel,
      nextLevel: status.nextLevel,
      hasFactor: status.hasFactor,
      pendingStories: 0,
      pendingEvents: 0,
    };
  }
  const [pendingStories, pendingEvents] = await Promise.all([
    countPendingStories(db),
    countPendingEvents(db),
  ]);
  return {
    signedIn: status.signedIn,
    role: status.role as UserRole,
    isSuperadmin,
    email: status.email,
    mfaAvailable: status.mfaAvailable,
    currentLevel: status.currentLevel,
    nextLevel: status.nextLevel,
    hasFactor: status.hasFactor,
    pendingStories,
    pendingEvents,
  };
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
