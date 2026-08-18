import { NextResponse } from "next/server";
import { createRouteClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { getUserAccount } from "@/server/data/users";
import { insertDeletionLog } from "@/server/data/deletion-log";
import { insertAuditLog } from "@/server/data/audit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. Confirm the caller is a signed-in admin who has completed MFA (AAL2).
  // getUser() (not getSession()) revalidates the JWT with the auth server.
  const supabase = createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const me = await getUserAccount(supabase, user.id);
  // superadmin is a superset of admin (mirrors requireAdmin).
  if (me?.role !== "admin" && me?.role !== "superadmin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") {
    return NextResponse.json({ error: "MFA required (AAL2)" }, { status: 403 });
  }

  // 2. Read request body.
  const body = (await req.json().catch(() => null)) as
    | { userId?: string; userEmail?: string }
    | null;
  if (!body?.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (body.userId === user.id) {
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

  // 4. POPIA audit log (long-term legal record) + admin audit log (operational).
  await Promise.all([
    insertDeletionLog(service, {
      user_email: body.userEmail ?? null,
      deleted_by: user.id,
    }),
    insertAuditLog(service, {
      action: "user_delete",
      actorId: user.id,
      actorEmail: me?.email ?? null,
      targetId: body.userId,
      meta: { target_email: body.userEmail ?? null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
