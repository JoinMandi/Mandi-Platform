import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { isProduction, requireEnv } from "@/server/env";

export interface SessionUser {
  sub: string;
  email: string | null;
  /** Cognito `amr` claim: PASSWORD, SOFTWARE_TOKEN_MFA, … */
  amr: string[];
  /** Unix seconds. */
  expiresAt: number;
}

export interface OAuthPending {
  state: string;
  nonce: string;
  verifier: string;
  next: string;
}

export interface SessionData {
  user?: SessionUser;
  oauth?: OAuthPending;
}

const MFA_METHODS = new Set([
  "SOFTWARE_TOKEN_MFA",
  "SMS_MFA",
  "EMAIL_OTP",
  "WEB_AUTHN",
]);

export function sessionOptions(): SessionOptions {
  return {
    cookieName: "mandi_session",
    password: requireEnv("SESSION_SECRET"),
    ttl: 60 * 60,
    cookieOptions: {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

export function isMfa(user: SessionUser | null | undefined): boolean {
  return !!user && user.amr.some((method) => MFA_METHODS.has(method));
}

export function isExpired(user: SessionUser): boolean {
  return user.expiresAt * 1000 <= Date.now();
}
