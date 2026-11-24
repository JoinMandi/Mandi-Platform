import fs from "node:fs";
import path from "node:path";
import { Pool, types, type QueryResult, type QueryResultRow } from "pg";
import { isProduction, requireEnv } from "@/server/env";

// Keep the row shapes the app already expects: timestamps and dates as ISO
// strings, bigint ids/counts as numbers.
types.setTypeParser(20, (v) => Number(v)); // int8
types.setTypeParser(1082, (v) => v); // date
types.setTypeParser(1114, (v) => v); // timestamp
types.setTypeParser(1184, (v) => v); // timestamptz

/** What a data-layer function receives: a pool or an open transaction client. */
export type Db = {
  query<R extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[],
  ): Promise<QueryResult<R>>;
};

type Kind = "app" | "service";

const pools = new Map<Kind, Pool>();

function poolConfig(kind: Kind) {
  const connectionString = requireEnv(
    kind === "service" ? "DATABASE_SERVICE_URL" : "DATABASE_APP_URL",
  );

  // RDS enforces TLS. The Amazon bundle ships in certs/ and is copied into the
  // image; local Postgres (DATABASE_SSL=false) runs without it.
  let ssl: { ca?: string; rejectUnauthorized: boolean } | undefined;
  if (process.env.DATABASE_SSL === "false") {
    ssl = undefined;
  } else if (isProduction()) {
    const caPath =
      process.env.PGSSLROOTCERT ??
      path.join(process.cwd(), "certs", "global-bundle.pem");
    if (!fs.existsSync(caPath)) {
      throw new Error(`RDS CA bundle not found at ${caPath}`);
    }
    ssl = { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true };
  }

  return {
    connectionString,
    ssl,
    max: kind === "service" ? 2 : 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    application_name: `mandi-${kind}`,
  };
}

export function getPool(kind: Kind = "app"): Pool {
  let pool = pools.get(kind);
  if (!pool) {
    pool = new Pool(poolConfig(kind));
    // A pool error must not crash the process (e.g. an idle connection dropped
    // during a database failover); the next query reconnects.
    pool.on("error", (err) => console.error(`pg ${kind} pool error`, err));
    pools.set(kind, pool);
  }
  return pool;
}

/** App-role pool: RLS applies. */
export function getAppPool(): Pool {
  return getPool("app");
}

/** Service-role pool: bypasses RLS. Use only for privileged operations. */
export function getServicePool(): Pool {
  return getPool("service");
}

/** Owner connection for migrations and scripts. */
export function getOwnerPool(): Pool {
  return new Pool({
    connectionString: requireEnv("DATABASE_URL"),
    max: 2,
    connectionTimeoutMillis: 10_000,
    application_name: "mandi-owner",
  });
}

export async function closePools(): Promise<void> {
  await Promise.all(Array.from(pools.values()).map((p) => p.end()));
  pools.clear();
}
