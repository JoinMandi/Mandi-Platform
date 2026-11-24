import { NextResponse } from "next/server";
import { exchangeCode, verifyIdToken } from "@/server/auth/cognito";
import { getSession } from "@/server/auth/session";
import { withUser } from "@/server/db/withUser";
import { seedUser } from "@/server/data/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const session = await getSession();
  const pending = session.oauth;
  if (!code || !state || !pending || pending.state !== state) {
    return NextResponse.redirect(new URL("/auth/login?error=state", req.url));
  }

  try {
    const tokens = await exchangeCode(code, pending.verifier);
    const claims = await verifyIdToken(tokens.id_token, pending.nonce);
    const sub = String(claims.sub);
    const email = typeof claims.email === "string" ? claims.email : null;
    const amr = Array.isArray(claims.amr) ? claims.amr.map(String) : [];

    // First login creates the member profile; existing rows keep their role.
    await withUser({ id: sub, role: "member" }, (db) =>
      seedUser(db, { id: sub, email, language_code: null }),
    );

    session.user = {
      sub,
      email,
      amr,
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    };
    delete session.oauth;
    await session.save();

    return NextResponse.redirect(new URL(pending.next, req.url));
  } catch (error) {
    console.error("[auth] callback failed", error);
    return NextResponse.redirect(new URL("/auth/login?error=callback", req.url));
  }
}
