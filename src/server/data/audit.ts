/**
 * Data access — admin_audit_log.
 *
 * Writes go through the service role (no INSERT policy on the table);
 * reads are superadmin-only via RLS.
 */
import type { Db } from "@/server/db/pool";
import { all, run } from "@/server/db/sql";
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

/** Never throws — the audit trail must not break the admin action itself. */
export async function insertAuditLog(
  service: Db,
  input: AuditLogInput,
): Promise<void> {
  try {
    await run(
      service,
      `insert into web.admin_audit_log
         (action, actor_id, actor_email, target_id, meta)
       values ($1,$2,$3,$4,$5)`,
      [
        input.action,
        input.actorId,
        input.actorEmail,
        input.targetId ?? null,
        input.meta ?? {},
      ],
    );
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

export async function listAuditLog(
  db: Db,
  q: AuditLogQuery = {},
): Promise<AdminAuditLogRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (q.action) {
    params.push(q.action);
    clauses.push(`action = $${params.length}`);
  }
  if (q.actorId) {
    params.push(q.actorId);
    clauses.push(`actor_id = $${params.length}`);
  }
  if (q.sinceDays) {
    params.push(new Date(Date.now() - q.sinceDays * 86_400_000).toISOString());
    clauses.push(`created_at >= $${params.length}`);
  }
  params.push(q.limit ?? 200);
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  return all<AdminAuditLogRow>(
    db,
    `select * from web.admin_audit_log
     ${where}
     order by created_at desc
     limit $${params.length}`,
    params,
  );
}
