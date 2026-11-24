import type { Db } from "@/server/db/pool";

/** Small typed query helpers. SQL lives in src/server/data/**, not here. */

export async function all<T>(
  db: Db,
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await db.query(sql, params);
  return result.rows as T[];
}

export async function one<T>(
  db: Db,
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const result = await db.query(sql, params);
  return (result.rows[0] as T | undefined) ?? null;
}

/** Returns the affected row count. */
export async function run(
  db: Db,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const result = await db.query(sql, params);
  return result.rowCount ?? 0;
}

export async function count(
  db: Db,
  sql: string,
  params: unknown[] = [],
): Promise<number> {
  const row = await one<{ n: number }>(db, sql, params);
  return Number(row?.n ?? 0);
}
