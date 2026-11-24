import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";

export const dynamic = "force-dynamic";

/** Current identity, role and MFA posture. 401 when not signed in. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ signedIn: false }, { status: 401 });
  }
  return NextResponse.json({
    signedIn: true,
    id: user.id,
    role: user.role,
    email: user.email,
    mfa: user.mfa,
  });
}
