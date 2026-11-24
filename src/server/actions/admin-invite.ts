"use server";

import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { requireAdminAal2, requireSuperadmin } from "@/server/auth";
import { insertAuditLog } from "@/server/data/audit";
import { upsertUserWithRole } from "@/server/data/users";
import { withService } from "@/server/db/withUser";
import type { UserRole } from "@/lib/types/database";

const VALID_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "member", "clinician", "admin", "superadmin",
]);
const PRIVILEGED_TIER: ReadonlySet<UserRole> = new Set<UserRole>([
  "admin", "superadmin",
]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cognito() {
  return new CognitoIdentityProviderClient({
    region: process.env.COGNITO_REGION ?? "af-south-1",
  });
}

/**
 * Invite a staff member: create the Cognito account (email invite), add the
 * role group, pre-seed web.users with the role, and write the audit row.
 */
export async function inviteAdminUser(
  email: string,
  role: UserRole,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_RE.test(cleanEmail)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!VALID_ROLES.has(role)) {
    return { ok: false, error: "Invalid role." };
  }

  let actor;
  try {
    actor = PRIVILEGED_TIER.has(role)
      ? await requireSuperadmin()
      : await requireAdminAal2();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }

  const poolId = process.env.COGNITO_USER_POOL_ID;
  if (!poolId) return { ok: false, error: "Cognito is not configured." };

  let sub: string | undefined;
  try {
    const result = await cognito().send(
      new AdminCreateUserCommand({
        UserPoolId: poolId,
        Username: cleanEmail,
        UserAttributes: [
          { Name: "email", Value: cleanEmail },
          { Name: "email_verified", Value: "true" },
        ],
        DesiredDeliveryMediums: ["EMAIL"],
      }),
    );
    sub = result.User?.Attributes?.find((a) => a.Name === "sub")?.Value;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cognito invite failed";
    return { ok: false, error: message };
  }

  if (!sub) return { ok: false, error: "Cognito did not return the new user id." };

  try {
    await cognito().send(
      new AdminAddUserToGroupCommand({
        UserPoolId: poolId,
        Username: cleanEmail,
        GroupName: role,
      }),
    );
  } catch {
    /* the DB role is authoritative; the group can be fixed later */
  }

  const seeded = await withService((db) =>
    upsertUserWithRole(db, {
      id: sub!,
      email: cleanEmail,
      role,
      languageCode: "en",
    }),
  );
  if (!seeded.ok) {
    return { ok: false, error: `Invited, but profile seed failed: ${seeded.error}` };
  }

  await withService((db) =>
    insertAuditLog(db, {
      action: "user_invite",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: sub!,
      meta: { email: cleanEmail, role },
    }),
  );

  return { ok: true, userId: sub };
}
