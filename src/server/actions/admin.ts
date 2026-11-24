"use server";

import { getSessionUser, requireAdmin } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
import { countPendingStories } from "@/server/data/stories";
import { countPendingEvents } from "@/server/data/events";
import { countUsers } from "@/server/data/users";
import { countPublishedClinics } from "@/server/data/clinics";
import { countResponses } from "@/server/data/questionnaire";
import type { UserRole } from "@/lib/types/database";

/** Role, MFA posture and moderation badge counts for the admin shell. */
export async function fetchAdminContext(): Promise<{
  signedIn: boolean;
  role: UserRole | null;
  isSuperadmin: boolean;
  email: string | null;
  mfaAvailable: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  hasFactor: boolean;
  pendingStories: number;
  pendingEvents: number;
}> {
  const user = await getSessionUser();
  if (!user) {
    return {
      signedIn: false,
      role: null,
      isSuperadmin: false,
      email: null,
      mfaAvailable: true,
      currentLevel: null,
      nextLevel: null,
      hasFactor: false,
      pendingStories: 0,
      pendingEvents: 0,
    };
  }

  const isSuperadmin = user.role === "superadmin";
  const isAdminTier = user.role === "admin" || isSuperadmin;
  const level = user.mfa ? "aal2" : "aal1";
  const base = {
    signedIn: true,
    role: user.role,
    isSuperadmin,
    email: user.email,
    mfaAvailable: true,
    currentLevel: level as "aal1" | "aal2",
    nextLevel: level as "aal1" | "aal2",
    hasFactor: user.mfa,
  };

  if (!isAdminTier) {
    return { ...base, pendingStories: 0, pendingEvents: 0 };
  }

  const counts = await withUser({ id: user.id, role: user.role }, async (db) => ({
    pendingStories: await countPendingStories(db),
    pendingEvents: await countPendingEvents(db),
  }));
  return { ...base, ...counts };
}

export async function fetchDashboardStats(): Promise<{
  pendingStories: number;
  pendingEvents: number;
  totalUsers: number;
  publishedClinics: number;
  totalResponses: number;
}> {
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, async (db) => ({
    pendingStories: await countPendingStories(db),
    pendingEvents: await countPendingEvents(db),
    totalUsers: await countUsers(db),
    publishedClinics: await countPublishedClinics(db),
    totalResponses: await countResponses(db),
  }));
}
