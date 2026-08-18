"use server";

/**
 * Self-targeted MFA helpers via service-role.
 *
 * The Supabase MFA docs are explicit: client-side
 * `supabase.auth.mfa.unenroll()` requires the caller to be at AAL2
 * (verified factor + completed challenge). That requirement creates a
 * deadlock if a user has stale, unverified factors blocking new
 * enrollment — they can't reach AAL2 without enrolling, but enrolling
 * fails on the unique-name collision, and they can't unenroll without
 * AAL2. The official escape is the service-role `auth.admin.mfa.*`
 * namespace (same one we already use for `auth.admin.deleteUser`).
 *
 * These actions self-target via `getSessionUser` — there is no user-
 * supplied `userId` parameter. A signed-in user can only inspect or
 * wipe their own factors.
 */

import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { getSessionUser } from "@/server/auth";

export interface MfaFactorSummary {
  id: string;
  status: string;
  factor_type: string;
  friendly_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** List every MFA factor on the current user — admin-API view (bypasses
 *  RLS so it sees verified + unverified + abandoned). Returns an empty
 *  shape when not signed in (caller will render an empty diagnose
 *  result rather than an error). */
export async function listMyMfaFactors(): Promise<{
  factors: MfaFactorSummary[];
}> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) return { factors: [] };
  const service = createServiceClient();
  const { data, error } = await service.auth.admin.mfa.listFactors({
    userId: user.id,
  });
  if (error) throw new Error(error.message);
  const factors: MfaFactorSummary[] = (data?.factors ?? []).map((f) => ({
    id: f.id,
    status: f.status,
    factor_type: f.factor_type,
    friendly_name: f.friendly_name ?? null,
    created_at: f.created_at ?? null,
    updated_at: f.updated_at ?? null,
  }));
  return { factors };
}

/** Service-role wipe of every MFA factor on the current user. The only
 *  reliable way to unstick a user whose `mfa.enroll()` keeps 422-ing on
 *  a friendly-name collision with a leftover unverified factor that
 *  client-side `unenroll` can't remove (AAL2 requirement). Returns the
 *  count deleted and any per-factor error messages so the page can
 *  surface them. */
export async function wipeMyMfaFactors(): Promise<{
  deleted: number;
  errors: string[];
}> {
  const db = createActionClient();
  const user = await getSessionUser(db);
  if (!user) throw new Error("Not authenticated");
  const service = createServiceClient();
  const { data, error: listErr } = await service.auth.admin.mfa.listFactors({
    userId: user.id,
  });
  if (listErr) throw new Error(listErr.message);
  const errors: string[] = [];
  let deleted = 0;
  for (const f of data?.factors ?? []) {
    // Only clear stale UNVERIFIED factors — those are what deadlock
    // re-enrollment. Never delete a verified factor from this AAL1-gated
    // path: a stolen password-only session must not be able to strip MFA
    // step-up. A lost verified device is an admin-assisted reset, not self
    // service. (This is the whole security fix for the tool.)
    if (f.status === "verified") continue;
    const { error } = await service.auth.admin.mfa.deleteFactor({
      id: f.id,
      userId: user.id,
    });
    if (error) errors.push(`${f.id.slice(0, 8)}: ${error.message}`);
    else deleted += 1;
  }
  return { deleted, errors };
}
