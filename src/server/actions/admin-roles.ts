"use server";

import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { requireAdminAal2, requireSuperadmin } from "@/server/auth";
import { insertAuditLog } from "@/server/data/audit";
import { getUserAccount } from "@/server/data/users";
import type { UserRole } from "@/lib/types/database";
import { listAuditLog, type AuditLogQuery } from "@/server/data/audit";

const VALID_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "member",
  "clinician",
  "admin",
  "superadmin",
]);

const PRIVILEGED_TIER: ReadonlySet<UserRole> = new Set<UserRole>([
  "admin",
  "superadmin",
]);

/**
 * Promote / demote a user.
 *
 * Tier rules (defence in depth — same logic enforced by
 * `trg_protect_user_role` at the DB level):
 *  - Touching the privileged tier (target's current role is superadmin,
 *    OR the new role is admin/superadmin) → requires superadmin.
 *  - Otherwise (member ↔ clinician) → requires admin (any admin tier,
 *    including superadmin via the widened `requireAdmin`). MFA enforced
 *    when the project has MFA enabled.
 *
 * Runs the actual UPDATE via the service client so the trigger's
 * `auth.uid() is null` bypass kicks in. The app-layer guard is the real
 * authorisation check; the trigger is the durable backstop.
 */
export async function setUserRole(
  userId: string,
  newRole: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  if (!VALID_ROLES.has(newRole)) {
    return { ok: false, error: "Invalid role" };
  }
  const db = createActionClient();

  // Look up the target's current role first — gating depends on both
  // sides of the transition. Use the action client (RLS-friendly read).
  const service = createServiceClient();
  const target = await getUserAccount(service, userId);
  if (!target) {
    return { ok: false, error: "User not found" };
  }
  const previousRole = target.role;
  if (previousRole === newRole) {
    return { ok: true }; // no-op
  }

  const touchesPrivilegedTier =
    PRIVILEGED_TIER.has(newRole) || previousRole === "superadmin";

  let actor;
  try {
    actor = touchesPrivilegedTier
      ? await requireSuperadmin(db)
      : await requireAdminAal2(db);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  if (actor.id === userId) {
    return { ok: false, error: "Refusing to change your own role" };
  }

  const { error: updErr } = await service
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);
  if (updErr) {
    return { ok: false, error: updErr.message };
  }

  // Sanity check: the DB trigger may have reverted the change (e.g. the
  // last-superadmin safeguard). Re-read and confirm.
  const after = await getUserAccount(service, userId);
  if (after?.role !== newRole) {
    return {
      ok: false,
      error: `Role change blocked by database safeguard (still ${after?.role ?? "unknown"}).`,
    };
  }

  await insertAuditLog(service, {
    action: "role_change",
    actorId: actor.id,
    actorEmail: actor.email ?? null,
    targetId: userId,
    meta: {
      from: previousRole,
      to: newRole,
      target_email: target.email ?? null,
    },
  });

  return { ok: true };
}

/** Read recent audit log entries for /admin/audit. Superadmin-only (RLS
 *  also enforces this via `is_superadmin_aal2()` — defence in depth). */
export async function fetchAuditLog(
  q: AuditLogQuery = {},
): Promise<ReturnType<typeof listAuditLog> extends Promise<infer T> ? T : never> {
  const db = createActionClient();
  await requireSuperadmin(db);
  return await listAuditLog(db, q);
}
