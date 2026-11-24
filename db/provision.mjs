#!/usr/bin/env node
/**
 * Creates or updates the two runtime roles. Run once per database, before
 * migrations. The owner connection comes from DATABASE_URL; passwords come
 * from the environment (Secrets Manager in staging).
 */
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const appPassword = process.env.DATABASE_APP_PASSWORD;
const servicePassword = process.env.DATABASE_SERVICE_PASSWORD;
if (!appPassword || !servicePassword) {
  console.error("DATABASE_APP_PASSWORD and DATABASE_SERVICE_PASSWORD are required");
  process.exit(1);
}

function ssl() {
  if (process.env.DATABASE_SSL === "false") return undefined;
  if (/localhost|127\.0\.0\.1/.test(url)) return undefined;
  const caPath = process.env.PGSSLROOTCERT ?? path.join(process.cwd(), "certs", "global-bundle.pem");
  return { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true };
}

const client = new Client({ connectionString: url, ssl: ssl() });

async function ensureRole(name, password, attributes) {
  const exists = await client.query("select 1 from pg_roles where rolname = $1", [name]);
  if (exists.rowCount === 0) {
    await client.query(`create role ${name} login`);
  }
  await client.query(`alter role ${name} with ${attributes}`);
  await client.query(
    `alter role ${name} with password ${client.escapeLiteral(password)}`,
  );
  console.log(`role ${name} ready`);
}

await client.connect();
try {
  // No BYPASSRLS: RDS does not let the master grant it. The service role gets
  // narrow RLS policies instead (see db/migrations/0004_rls.sql).
  await ensureRole("mandi_app", appPassword, "login inherit nocreatedb nocreaterole");
  await ensureRole("mandi_service", servicePassword, "login inherit nocreatedb nocreaterole");
} finally {
  await client.end();
}
