import { NextResponse } from "next/server";
import { checkDatabase } from "@/server/db/health";

export const dynamic = "force-dynamic";

/** Load balancer / CloudFront health probe. No auth, no internals. */
export async function GET() {
  const db = await checkDatabase();
  return NextResponse.json(
    { status: db ? "ok" : "degraded", db: db ? "ok" : "unavailable" },
    { status: db ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
