import { getAppPool } from "@/server/db/pool";

/** True when the database answers a trivial query within the timeout. */
export async function checkDatabase(): Promise<boolean> {
  try {
    const pool = getAppPool();
    const client = await pool.connect();
    try {
      await client.query("set statement_timeout = 2000");
      await client.query("select 1");
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("health check failed", error);
    return false;
  }
}
