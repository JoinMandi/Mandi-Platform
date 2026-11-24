import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Database authorisation tests. These run only when TEST_DATABASE_URL is set
 * (CI db job, or `npm run test:db` with .env.local). They assume the database
 * has been provisioned and migrated.
 */

const ownerUrl = process.env.TEST_DATABASE_URL;
const appUrl =
  process.env.TEST_APP_DATABASE_URL ??
  "postgres://mandi_app:localdev@localhost:5433/mandi_test";
const serviceUrl =
  process.env.TEST_SERVICE_DATABASE_URL ??
  "postgres://mandi_service:localdev@localhost:5433/mandi_test";

const A = "11111111-1111-4111-8111-111111111111";
const B = "22222222-2222-4222-8222-222222222222";
const ADMIN = "33333333-3333-4333-8333-333333333333";
const CLINICIAN = "44444444-4444-4444-8444-444444444444";
const SUPER = "55555555-5555-4555-8555-555555555555";
const VERSION = "66666666-6666-4666-8666-666666666666";
const RUN_A = "77777777-7777-4777-8777-777777777771";
const RUN_B = "77777777-7777-4777-8777-777777777772";
const RUN_SUBMITTED = "77777777-7777-4777-8777-777777777773";

function client(url: string) {
  return new Client({ connectionString: url });
}

async function as(
  userId: string | null,
  role: string | null,
  fn: (c: Client) => Promise<void>,
) {
  const c = client(appUrl);
  await c.connect();
  try {
    await c.query("begin");
    await c.query(
      "select set_config('app.user_id', $1, true), set_config('app.user_role', $2, true)",
      [userId ?? "", role ?? ""],
    );
    await fn(c);
  } finally {
    await c.query("rollback").catch(() => {});
    await c.end();
  }
}

async function count(c: Client, sql: string, params: unknown[] = []) {
  const result = await c.query<{ n: number }>(sql, params);
  return Number(result.rows[0].n);
}

describe.skipIf(!ownerUrl)("database authorisation", () => {
  const owner = ownerUrl ? client(ownerUrl) : null;

  beforeAll(async () => {
    if (!owner) return;
    await owner.connect();
    await owner.query(`
      truncate table
        care.audit_events,
        care.consent_records,
        web.questionnaire_items,
        web.questionnaire_runs,
        web.questionnaire_versions,
        care.questionnaire_responses,
        care.symptom_logs,
        care.clinical_screenings,
        care.checkins,
        web.exhibition_signups,
        web.engagement_events,
        web.admin_audit_log,
        web.users
      restart identity cascade
    `);

    await owner.query(
      `insert into web.users (id, email, role) values
         ($1,'a@example.test','member'),
         ($2,'b@example.test','member'),
         ($3,'admin@example.test','admin'),
         ($4,'clinician@example.test','clinician'),
         ($5,'super@example.test','superadmin')`,
      [A, B, ADMIN, CLINICIAN, SUPER],
    );

    await owner.query(
      `insert into web.questionnaire_versions (id, version, definition, published_at)
       values ($1, 'v1', '{}'::jsonb, now())`,
      [VERSION],
    );

    await owner.query(
      `insert into web.questionnaire_runs (id, user_id, version_id, status, submitted_at) values
         ($1,$2,$4,'in_progress',null),
         ($3,$5,$4,'in_progress',null),
         ('${RUN_SUBMITTED}',$2,$4,'submitted',now())`,
      [RUN_A, A, RUN_B, VERSION, B],
    );

    await owner.query(
      `insert into web.questionnaire_items (run_id, question_key, answer) values
         ($1,'q1','"0"'::jsonb),
         ($2,'q1','"3"'::jsonb)`,
      [RUN_A, RUN_B],
    );

    await owner.query(
      `insert into care.consent_records (user_id, run_id, consent_code, wording_version, wording_hash)
       values ($1,$2,'C1','2026-11','hash')`,
      [A, RUN_A],
    );

    await owner.query(
      `insert into care.audit_events (actor_id, action, entity, entity_id)
       values ($1,'run.submitted','questionnaire_run','${RUN_SUBMITTED}')`,
      [A],
    );
  });

  afterAll(async () => {
    await owner?.end().catch(() => {});
  });

  it("anonymous callers read no runs, items or consent", async () => {
    await as(null, null, async (c) => {
      expect(await count(c, "select count(*)::int as n from web.questionnaire_runs")).toBe(0);
      expect(await count(c, "select count(*)::int as n from web.questionnaire_items")).toBe(0);
      expect(await count(c, "select count(*)::int as n from care.consent_records")).toBe(0);
    });
  });

  it("a member reads only her own run and items", async () => {
    await as(A, "member", async (c) => {
      expect(await count(c, "select count(*)::int as n from web.questionnaire_runs")).toBe(2);
      expect(
        await count(c, "select count(*)::int as n from web.questionnaire_runs where id = $1", [RUN_B]),
      ).toBe(0);
      expect(await count(c, "select count(*)::int as n from web.questionnaire_items")).toBe(1);
    });
  });

  it("a member cannot write into another member's run", async () => {
    await as(A, "member", async (c) => {
      await expect(
        c.query(
          "insert into web.questionnaire_items (run_id, question_key, answer) values ($1,'q2','1'::jsonb)",
          [RUN_B],
        ),
      ).rejects.toThrow(/row-level security|violates/);
    });
  });

  it("a member cannot claim another user_id on a run", async () => {
    await as(A, "member", async (c) => {
      await expect(
        c.query(
          "insert into web.questionnaire_runs (user_id, version_id) values ($1,$2)",
          [B, VERSION],
        ),
      ).rejects.toThrow(/row-level security|violates/);
    });
  });

  it("a submitted run cannot be updated", async () => {
    await as(A, "member", async (c) => {
      const result = await c.query(
        "update web.questionnaire_runs set status = 'abandoned' where id = $1",
        [RUN_SUBMITTED],
      );
      expect(result.rowCount).toBe(0);
    });
  });

  it("consent and audit rows are append-only", async () => {
    await as(A, "member", async (c) => {
      const consent = await c.query("update care.consent_records set wording_version = 'x'");
      expect(consent.rowCount).toBe(0);
      const audit = await c.query("delete from care.audit_events");
      expect(audit.rowCount).toBe(0);
    });
  });

  it("a clinician sees no unmatched health data", async () => {
    await as(CLINICIAN, "clinician", async (c) => {
      expect(await count(c, "select count(*)::int as n from care.questionnaire_responses")).toBe(0);
      expect(await count(c, "select count(*)::int as n from web.questionnaire_runs")).toBe(0);
    });
  });

  it("an admin reads health rows but not the audit ledger", async () => {
    await as(ADMIN, "admin", async (c) => {
      expect(await count(c, "select count(*)::int as n from web.questionnaire_runs")).toBe(3);
      expect(await count(c, "select count(*)::int as n from care.consent_records")).toBe(1);
      expect(await count(c, "select count(*)::int as n from care.audit_events")).toBe(0);
    });
  });

  it("a superadmin reads the audit ledger", async () => {
    await as(SUPER, "superadmin", async (c) => {
      expect(await count(c, "select count(*)::int as n from care.audit_events")).toBe(1);
    });
  });

  it("the service role writes audit events", async () => {
    const c = client(serviceUrl);
    await c.connect();
    try {
      // The service role has no BYPASSRLS; it identifies itself via the GUC.
      await c.query("select set_config('app.user_role', 'service', false)");
      await c.query(
        "insert into care.audit_events (action, entity) values ('test.service','audit')",
      );
      expect(await count(c, "select count(*)::int as n from care.audit_events")).toBe(2);
    } finally {
      await c.end();
    }
  });
});
