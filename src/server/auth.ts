/**
 * Application-layer auth/role guards. Used by Server Actions and Route
 * Handlers. Identity comes from the sealed Cognito session cookie; the role
 * comes from web.users (the source of truth), never from the token alone.
 */
import type { UserRole } from "@/lib/types/database";
import { getSession, isExpired, isMfa } from "@/server/auth/session";
import { getUserAccount } from "@/server/data/users";
import { withUser } from "@/server/db/withUser";

export interface SessionUser {
  id: string;
  email: string | null;
  role: UserRole;
  /** True when the Cognito session completed a TOTP/other MFA challenge. */
  mfa: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getSession();
  const claims = session.user;
  if (!claims || isExpired(claims)) return null;

  const account = await withUser({ id: claims.sub, role: "" }, (db) =>
    getUserAccount(db, claims.sub),
  );

  return {
    id: claims.sub,
    email: account?.email ?? claims.email,
    role: account?.role ?? "member",
    mfa: isMfa(claims),
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("Insufficient role");
  return user;
}

/** Admin tier = admin OR superadmin (superadmin is a strict superset). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "admin" && user.role !== "superadmin") {
    throw new Error("Admin access required");
  }
  return user;
}

/** Admin + a completed MFA challenge. Fails closed when MFA is absent. */
export async function requireAdminAal2(): Promise<SessionUser> {
  const user = await requireAdmin();
  if (!user.mfa) throw new Error("MFA required (AAL2)");
  return user;
}

/** Top tier + MFA. */
export async function requireSuperadmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "superadmin") throw new Error("Superadmin access required");
  if (!user.mfa) throw new Error("MFA required (AAL2)");
  return user;
}

/** Reports the signed-in user's auth posture for the AdminShell gate. */
export async function getAdminAuthStatus(): Promise<{
  signedIn: boolean;
  role: UserRole | null;
  email: string | null;
  mfaAvailable: boolean;
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  hasFactor: boolean;
}> {
  const user = await getSessionUser();
  if (!user) {
    return {
      signedIn: false,
      role: null,
      email: null,
      mfaAvailable: true,
      currentLevel: null,
      nextLevel: null,
      hasFactor: false,
    };
  }
  const level = user.mfa ? "aal2" : "aal1";
  return {
    signedIn: true,
    role: user.role,
    email: user.email,
    // The Cognito pool requires TOTP for every account, so MFA is always
    // available; a session without it is blocked rather than waved through.
    mfaAvailable: true,
    currentLevel: level,
    nextLevel: level,
    hasFactor: user.mfa,
  };
}
