import { NextResponse } from "next/server";
import { authorizeUrl, randomToken } from "@/server/auth/cognito";
import { getSession } from "@/server/auth/session";

/** Starts the Cognito hosted-UI flow (PKCE, state + nonce in the sealed cookie). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const requested = url.searchParams.get("next");
  const next =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/my-journey";
  const signup = url.searchParams.get("signup") === "1";

  const state = randomToken();
  const nonce = randomToken();
  const verifier = randomToken();

  const session = await getSession();
  session.oauth = { state, nonce, verifier, next };
  await session.save();

  return NextResponse.redirect(
    authorizeUrl({ state, nonce, verifier, signup }),
  );
}
