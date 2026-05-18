import { NextResponse } from "next/server";
import { createRouteClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { getUserAccount } from "@/server/data/users";
import { insertDeletionLog } from "@/server/data/deletion-log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Confirm the caller is a signed-in admin (cookie-based auth).
  const supabase = createRouteClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const me = await getUserAccount(supabase, session.user.id);
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  // 2. Read request body.
  const body = (await req.json().catch(() => null)) as
    | { userId?: string; userEmail?: string }
    | null;
  if (!body?.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (body.userId === session.user.id) {
    return NextResponse.json({ error: "Refusing to delete self" }, { status: 400 });
  }

  // 3. Service-role client deletes from auth.users (cascades to all their data).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Service role not configured on server" },
      { status: 500 },
    );
  }
  const service = createServiceClient();
  const { error: delErr } = await service.auth.admin.deleteUser(body.userId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  // 4. POPIA audit log.
  await insertDeletionLog(service, {
    user_email: body.userEmail ?? null,
    deleted_by: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
