/** Application-layer auth/role guards. Used by Server Actions and Route Handlers. */
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getUserRole } from "@/server/data/users";

/** The signed-in user for this request, or null. */
export async function getSessionUser(db: SupabaseClient): Promise<User | null> {
  const {
    data: { session },
  } = await db.auth.getSession();
  return session?.user ?? null;
}

/** Asserts the caller is a signed-in admin OR superadmin; throws otherwise.
 *  Superadmin is a strict superset of admin — every admin-gated path in the
 *  app passes for superadmin without further code change. */
export async function requireAdmin(db: SupabaseClient): Promise<User> {
  const user = await getSessionUser(db);
  if (!user) throw new Error("Not authenticated");
  const role = await getUserRole(db, user.id);
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Admin access required");
  }
  return user;
}

/**
 * Asserts the caller is a signed-in superadmin (the top tier).
 *
 * Used to gate privileged-tier mutations: minting an admin or superadmin,
 * demoting a superadmin, inviting at admin/superadmin level. Defensive
 * about MFA the same way `requireAdminAal2` is — only enforces AAL2 when
 * MFA is available at the Supabase project level, so a config gap doesn't
 * lock the team out of their own privileged operations.
 */
export async function requireSuperadmin(db: SupabaseClient): Promise<User> {
  const user = await getSessionUser(db);
  if (!user) throw new Error("Not authenticated");
  const role = await getUserRole(db, user.id);
  if (role !== "superadmin") {
    throw new Error("Superadmin access required");
  }
  let currentLevel: "aal1" | "aal2" | null = null;
  let mfaAvailable = true;
  try {
    const { data, error } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) mfaAvailable = false;
    else currentLevel = (data?.currentLevel as "aal1" | "aal2" | null) ?? null;
  } catch {
    mfaAvailable = false;
  }
  if (mfaAvailable && currentLevel !== "aal2") {
    throw new Error("MFA required (AAL2)");
  }
  return user;
}

/**
 * Asserts the caller is a signed-in admin AND — if MFA is available at the
 * Supabase project level — the current session is at Authenticator Assurance
 * Level 2 (i.e. they completed an MFA challenge).
 *
 * Defensive about MFA in the same way `getAdminAuthStatus` is: if the project
 * doesn't have MFA enabled (or the auth-helpers version mismatches), the AAL
 * call rejects — and we must NEVER lock admins out of their own surface
 * because of a config gap. When MFA becomes available, enforcement resumes
 * automatically with no code change.
 *
 * Used to gate the most sensitive admin paths: role changes, user deletion,
 * audit log read, content publish/unpublish.
 */
export async function requireAdminAal2(db: SupabaseClient): Promise<User> {
  const user = await requireAdmin(db);
  let currentLevel: "aal1" | "aal2" | null = null;
  let mfaAvailable = true;
  try {
    const { data, error } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) mfaAvailable = false;
    else currentLevel = (data?.currentLevel as "aal1" | "aal2" | null) ?? null;
  } catch {
    mfaAvailable = false;
  }
  if (mfaAvailable && currentLevel !== "aal2") {
    throw new Error("MFA required (AAL2)");
  }
  return user;
}

/** Reports the current admin's auth posture for the AdminShell gate. */
export async function getAdminAuthStatus(db: SupabaseClient): Promise<{
  /** Signed-in flag — true if cookies represent a valid session. */
  signedIn: boolean;
  role: string | null;
  email: string | null;
  /** True if the Supabase project has MFA available AND we could query it. */
  mfaAvailable: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  /** True if the admin has at least one verified TOTP factor enrolled. */
  hasFactor: boolean;
}> {
  const user = await getSessionUser(db);
  if (!user) {
    return {
      signedIn: false,
      role: null,
      email: null,
      mfaAvailable: false,
      currentLevel: null,
      nextLevel: null,
      hasFactor: false,
    };
  }
  const role = await getUserRole(db, user.id);

  // MFA calls are wrapped defensively AND run in parallel. If MFA isn't
  // enabled at the Supabase project level (or the auth-helpers version
  // mismatches), these can reject — and we must NEVER lock admins out as
  // a result. mfaAvailable=false tells AdminShell to skip the AAL2 gate.
  // Parallelising the two probes shaves an MFA-roundtrip off /admin's
  // initial paint.
  type AalProbe =
    | { ok: true; data: { currentLevel?: string | null; nextLevel?: string | null } | null }
    | { ok: false };
  type FactorsProbe =
    | { ok: true; data: { totp?: { status: string }[] } | null }
    | { ok: false };
  const [aalProbe, factorsProbe] = await Promise.all<[Promise<AalProbe>, Promise<FactorsProbe>]>([
    db.auth.mfa
      .getAuthenticatorAssuranceLevel()
      .then<AalProbe>((r) => (r.error ? { ok: false } : { ok: true, data: r.data ?? null }))
      .catch<AalProbe>(() => ({ ok: false })),
    db.auth.mfa
      .listFactors()
      .then<FactorsProbe>((r) => (r.error ? { ok: false } : { ok: true, data: r.data ?? null }))
      .catch<FactorsProbe>(() => ({ ok: false })),
  ]);
  // Either probe failing means we can't trust the MFA posture — fall back
  // to "MFA not available at the project level."
  const mfaAvailable = aalProbe.ok && factorsProbe.ok;
  const currentLevel: "aal1" | "aal2" | null = aalProbe.ok
    ? ((aalProbe.data?.currentLevel as "aal1" | "aal2" | null) ?? null)
    : null;
  const nextLevel: "aal1" | "aal2" | null = aalProbe.ok
    ? ((aalProbe.data?.nextLevel as "aal1" | "aal2" | null) ?? null)
    : null;
  const hasFactor = factorsProbe.ok
    ? (factorsProbe.data?.totp ?? []).some((f) => f.status === "verified")
    : false;

  return {
    signedIn: true,
    role: role ?? null,
    email: user.email ?? null,
    mfaAvailable,
    currentLevel,
    nextLevel,
    hasFactor,
  };
}
