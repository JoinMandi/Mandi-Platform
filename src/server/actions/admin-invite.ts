"use server";

import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { requireAdminAal2, requireSuperadmin } from "@/server/auth";
import { insertAuditLog } from "@/server/data/audit";
import { upsertUserWithRole } from "@/server/data/users";
import type { UserRole } from "@/lib/types/database";

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

// Conservative-ish email shape; Supabase validates the real shape itself,
// this is just to fail fast on obvious typos before we burn a rate-limit slot.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Vercel preview/prod fallback.
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/**
 * Invite a new user by email with a pre-set role.
 *
 * Flow:
 *  1. App-layer guard (`requireAdminAal2`) — current admin must be authorised.
 *     Defensive about MFA so it works on Supabase projects without MFA enabled.
 *  2. Service client calls `auth.admin.inviteUserByEmail(email)` — Supabase
 *     creates the `auth.users` row in "invited" state and sends a magic-link
 *     email using the project's Invite-user template + SMTP config.
 *  3. Service client upserts `public.users` with the chosen `role` so the
 *     invitee lands on the correct admin/clinician/member surface on first
 *     sign-in (instead of defaulting to `member` and requiring a second
 *     promote click).
 *  4. Audit row written (`user_invite` with email + role in meta).
 *
 * Returns a discriminated result so the UI can render errors inline rather
 * than throwing into the React tree.
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

  const db = createActionClient();
  let actor;
  try {
    // Inviting at admin/superadmin level mints privileged accounts — that
    // is exactly the operation Phase 12 reserves for superadmins. Inviting
    // at member/clinician is admin-tier.
    actor = PRIVILEGED_TIER.has(role)
      ? await requireSuperadmin(db)
      : await requireAdminAal2(db);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unauthorized",
    };
  }

  const service = createServiceClient();

  // 1. Supabase sends the invite + creates the auth row.
  const { data, error } = await service.auth.admin.inviteUserByEmail(
    cleanEmail,
    { redirectTo: `${getSiteUrl()}/admin` },
  );
  if (error) {
    return { ok: false, error: error.message };
  }
  const invited = data.user;
  if (!invited) {
    return { ok: false, error: "Supabase did not return the invited user." };
  }

  // 2. Pre-seed public.users with the chosen role. Trigger-friendly via
  //    service role.
  const upsert = await upsertUserWithRole(service, {
    id: invited.id,
    email: cleanEmail,
    role,
    languageCode: "en",
  });
  if (!upsert.ok) {
    return { ok: false, error: `Invited, but seed failed: ${upsert.error}` };
  }

  // 3. Audit.
  await insertAuditLog(service, {
    action: "user_invite",
    actorId: actor.id,
    actorEmail: actor.email ?? null,
    targetId: invited.id,
    meta: { email: cleanEmail, role },
  });

  return { ok: true, userId: invited.id };
}
