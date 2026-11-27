import { createHash, randomBytes } from "node:crypto";
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { requireEnv } from "@/server/env";
import type { UserRole } from "@/lib/types/database";

interface CognitoConfig {
  region: string;
  userPoolId: string;
  clientId: string;
  clientSecret: string;
  appUrl: string;
}

export function cognitoConfig(): CognitoConfig {
  return {
    region: process.env.COGNITO_REGION ?? "af-south-1",
    userPoolId: requireEnv("COGNITO_USER_POOL_ID"),
    clientId: requireEnv("COGNITO_CLIENT_ID"),
    clientSecret: requireEnv("COGNITO_CLIENT_SECRET"),
    appUrl: requireEnv("APP_URL").replace(/\/$/, ""),
  };
}

function domainBase(): string {
  const raw = requireEnv("COGNITO_DOMAIN")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  return `https://${raw}`;
}

export function issuer(): string {
  const { region, userPoolId } = cognitoConfig();
  return `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function authorizeUrl(input: {
  state: string;
  nonce: string;
  verifier: string;
  signup?: boolean;
}): string {
  const { clientId, appUrl } = cognitoConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: `${appUrl}/auth/callback`,
    state: input.state,
    nonce: input.nonce,
    code_challenge: pkceChallenge(input.verifier),
    code_challenge_method: "S256",
  });
  const path = input.signup ? "signup" : "oauth2/authorize";
  return `${domainBase()}/${path}?${params.toString()}`;
}

export function logoutUrl(): string {
  const { clientId, appUrl } = cognitoConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: `${appUrl}/auth/logged-out`,
  });
  return `${domainBase()}/logout?${params.toString()}`;
}

export interface TokenSet {
  id_token: string;
  access_token: string;
  expires_in: number;
}

export async function exchangeCode(
  code: string,
  verifier: string,
): Promise<TokenSet> {
  const { clientId, clientSecret, appUrl } = cognitoConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: `${appUrl}/auth/callback`,
    code_verifier: verifier,
  });
  const response = await fetch(`${domainBase()}/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body,
  });
  if (!response.ok) {
    throw new Error(`Cognito token exchange failed (${response.status})`);
  }
  const json = (await response.json()) as Partial<TokenSet>;
  if (!json.id_token || !json.access_token) {
    throw new Error("Cognito token response missing tokens");
  }
  return {
    id_token: json.id_token,
    access_token: json.access_token,
    expires_in: json.expires_in ?? 3600,
  };
}

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let cognitoAdmin: CognitoIdentityProviderClient | undefined;
let poolMfa: boolean | undefined;

/**
 * Cognito does not put `acr`/`amr` in this pool's ID tokens, and AdminGetUser
 * reports no hosted-UI TOTP enrolment. The user pool policy is the reliable
 * signal: with `MfaConfiguration` ON, no authorization code is issued without
 * an MFA challenge. Cached per process and fails closed on error.
 */
export async function poolRequiresMfa(): Promise<boolean> {
  if (poolMfa !== undefined) return poolMfa;
  const { region, userPoolId } = cognitoConfig();
  cognitoAdmin ??= new CognitoIdentityProviderClient({ region });
  try {
    const pool = await cognitoAdmin.send(
      new DescribeUserPoolCommand({ UserPoolId: userPoolId }),
    );
    poolMfa = pool.UserPool?.MfaConfiguration === "ON";
  } catch (error) {
    console.error("[auth] MFA policy lookup failed", error);
    poolMfa = false;
  }
  return poolMfa;
}

export async function verifyIdToken(
  idToken: string,
  nonce: string,
): Promise<JWTPayload> {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${issuer()}/.well-known/jwks.json`));
  }
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: issuer(),
    audience: cognitoConfig().clientId,
  });
  if (payload.token_use !== "id") throw new Error("Not an ID token");
  if (payload.nonce !== nonce) throw new Error("Nonce mismatch");
  return payload;
}

export function roleFromGroups(groups: string[]): UserRole {
  if (groups.includes("superadmin")) return "superadmin";
  if (groups.includes("admin")) return "admin";
  if (groups.includes("clinician")) return "clinician";
  return "member";
}

export function groupsFromClaims(payload: JWTPayload): string[] {
  const groups = payload["cognito:groups"];
  return Array.isArray(groups) ? groups.map(String) : [];
}
