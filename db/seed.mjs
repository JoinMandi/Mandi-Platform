#!/usr/bin/env node
/** Runs db/seeds/public-content.sql against DATABASE_URL. Idempotent. */
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const file = path.join(process.cwd(), "db", "seeds", "public-content.sql");
const sql = fs.readFileSync(file, "utf8");

const client = new Client({
  connectionString: url,
  ssl:
    process.env.DATABASE_SSL === "false" || /localhost|127\.0\.0\.1/.test(url)
      ? undefined
      : {
          ca: fs.readFileSync(
            process.env.PGSSLROOTCERT ??
              path.join(process.cwd(), "certs", "global-bundle.pem"),
            "utf8",
          ),
          rejectUnauthorized: true,
        },
});

await client.connect();
try {
  await client.query(sql);
  console.log("public content seeded");
} finally {
  await client.end();
}
