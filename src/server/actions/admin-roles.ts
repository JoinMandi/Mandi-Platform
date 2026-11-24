"use server";

import { requireAdminAal2, requireSuperadmin } from "@/server/auth";
import {
  insertAuditLog,
  listAuditLog,
  type AuditLogQuery,
} from "@/server/data/audit";
import {
  getUserAccount,
  setUserRole as setUserRoleRow,
} from "@/server/data/users";
import { withService, withUser } from "@/server/db/withUser";
import type { UserRole } from "@/lib/types/database";

const VALID_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "member", "clinician", "admin", "superadmin",
]);
const PRIVILEGED_TIER: ReadonlySet<UserRole> = new Set<UserRole>([
  "admin", "superadmin",
]);

/**
 * Promote / demote a user. Tier rules mirror `trg_protect_user_role`:
 *  - touching admin/superadmin (either side) requires superadmin;
 *  - member ↔ clinician requires an admin with MFA.
 */
export async function setUserRole(
  userId: string,
  newRole: UserRole,
): Promise<{ ok: boolean; error?: string }> {
  if (!VALID_ROLES.has(newRole)) {
    return { ok: false, error: "Invalid role" };
  }

  const target = await withService((db) => getUserAccount(db, userId));
  if (!target) return { ok: false, error: "User not found" };
  const previousRole = target.role;
  if (previousRole === newRole) return { ok: true };

  const touchesPrivilegedTier =
    PRIVILEGED_TIER.has(newRole) || previousRole === "superadmin";

  let actor;
  try {
    actor = touchesPrivilegedTier
      ? await requireSuperadmin()
      : await requireAdminAal2();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  if (actor.id === userId) {
    return { ok: false, error: "Refusing to change your own role" };
  }

  try {
    await withService((db) => setUserRoleRow(db, userId, newRole));
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Role update failed",
    };
  }

  const after = await withService((db) => getUserAccount(db, userId));
  if (after?.role !== newRole) {
    return {
      ok: false,
      error: `Role change blocked by database safeguard (still ${after?.role ?? "unknown"}).`,
    };
  }

  await withService((db) =>
    insertAuditLog(db, {
      action: "role_change",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: userId,
      meta: { from: previousRole, to: newRole, target_email: target.email },
    }),
  );

  return { ok: true };
}

/** Recent audit entries for /admin/audit. Superadmin only. */
export async function fetchAuditLog(q: AuditLogQuery = {}) {
  const actor = await requireSuperadmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listAuditLog(db, q));
}
