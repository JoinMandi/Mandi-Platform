/**
 * Data access — admin_audit_log.
 *
 * INSERT path is service-role only (no RLS insert policy on the table). Callers
 * obtain a service client via `createServiceClient()` and call `insertAuditLog`
 * after their app-layer guard (`requireAdminAal2`) has passed.
 *
 * READ path uses the signed-in admin's session (RLS gates SELECT to AAL2).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminAuditAction,
  AdminAuditLogRow,
} from "@/lib/types/database";

export interface AuditLogInput {
  action: AdminAuditAction;
  actorId: string | null;
  actorEmail: string | null;
  targetId?: string | null;
  meta?: Record<string, unknown>;
}

/** Insert one audit row. Never throws — the audit trail must never break the
 *  underlying admin action itself; bad inserts are logged but swallowed. */
export async function insertAuditLog(
  service: SupabaseClient,
  input: AuditLogInput,
): Promise<void> {
  try {
    await service.from("admin_audit_log").insert({
      action: input.action,
      actor_id: input.actorId,
      actor_email: input.actorEmail,
      target_id: input.targetId ?? null,
      meta: input.meta ?? {},
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] insertAuditLog failed:", err);
  }
}

export interface AuditLogQuery {
  limit?: number;
  action?: AdminAuditAction;
  actorId?: string;
  sinceDays?: number;
}

/** List recent audit rows for the /admin/audit viewer. */
export async function listAuditLog(
  db: SupabaseClient,
  q: AuditLogQuery = {},
): Promise<AdminAuditLogRow[]> {
  let query = db
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(q.limit ?? 200);
  if (q.action) query = query.eq("action", q.action);
  if (q.actorId) query = query.eq("actor_id", q.actorId);
  if (q.sinceDays) {
    const since = new Date(Date.now() - q.sinceDays * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", since);
  }
  const { data } = await query;
  return (data ?? []) as AdminAuditLogRow[];
}
