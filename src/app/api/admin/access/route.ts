import { NextResponse } from "next/server";
import { getSessionUser } from "@/server/auth";

export const dynamic = "force-dynamic";

/**
 * Machine-checkable admin gate for the Phase 0 acceptance script.
 * 401 unauthenticated · 403 wrong role or no MFA · 200 for an AAL2 admin.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== "admin" && user.role !== "superadmin") {
    return NextResponse.json({ error: "Admin only", role: user.role }, { status: 403 });
  }
  if (!user.mfa) {
    return NextResponse.json({ error: "MFA required (AAL2)" }, { status: 403 });
  }
  return NextResponse.json({ ok: true, role: user.role });
}
