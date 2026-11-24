import { NextResponse } from "next/server";
import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { requireAdminAal2 } from "@/server/auth";
import { getUserAccount, deleteUserRow } from "@/server/data/users";
import { insertDeletionLog } from "@/server/data/deletion-log";
import { insertAuditLog } from "@/server/data/audit";
import { deleteExhibitionSignupsByEmail } from "@/server/data/exhibition-signups";
import { withService } from "@/server/db/withUser";

export const runtime = "nodejs";

/**
 * Admin-only hard delete: Cognito account first, then the profile row (health
 * rows cascade) plus the POPIA and admin audit records.
 */
export async function POST(req: Request) {
  // Same-origin check for this raw route handler.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  let actor;
  try {
    actor = await requireAdminAal2();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unauthorized";
    return NextResponse.json(
      { error: message },
      { status: message === "Not authenticated" ? 401 : 403 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { userId?: string; userEmail?: string }
    | null;
  if (!body?.userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  if (body.userId === actor.id) {
    return NextResponse.json({ error: "Refusing to delete self" }, { status: 400 });
  }

  const target = await withService((db) => getUserAccount(db, body.userId!));
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const poolId = process.env.COGNITO_USER_POOL_ID;
  if (!poolId) {
    return NextResponse.json({ error: "Cognito is not configured" }, { status: 500 });
  }

  if (target.email) {
    try {
      await new CognitoIdentityProviderClient({
        region: process.env.COGNITO_REGION ?? "af-south-1",
      }).send(
        new AdminDeleteUserCommand({
          UserPoolId: poolId,
          Username: target.email,
        }),
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Cognito delete failed" },
        { status: 500 },
      );
    }
  }

  const email = target.email ?? body.userEmail ?? null;
  await withService(async (db) => {
    if (email) await deleteExhibitionSignupsByEmail(db, email);
    await deleteUserRow(db, body.userId!);
    await insertDeletionLog(db, { user_email: email, deleted_by: actor.id });
    await insertAuditLog(db, {
      action: "user_delete",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: body.userId!,
      meta: { target_email: email },
    });
  });

  return NextResponse.json({ ok: true });
}
