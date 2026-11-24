import { getAppPool, getServicePool, type Db } from "@/server/db/pool";

export type RequestUser = { id: string; role: string } | null;

/**
 * Runs `fn` in a transaction on the app-role pool with the request identity set
 * as transaction-local GUCs. RLS policies read them through
 * `web.current_user_id()` / `web.user_role()`.
 *
 * Every request that touches user data must go through here (or through
 * `withService` for privileged operations). Without it, RLS sees an anonymous
 * caller and returns no rows.
 */
export async function withUser<T>(
  user: RequestUser,
  fn: (db: Db) => Promise<T>,
): Promise<T> {
  const client = await getAppPool().connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.user_id', $1, true)", [
      user?.id ?? "",
    ]);
    await client.query("select set_config('app.user_role', $1, true)", [
      user?.role ?? "",
    ]);
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/** Anonymous read/write (public pages, questionnaire funnel). Still RLS-bound. */
export function withAnon<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  return withUser(null, fn);
}

/**
 * Privileged path. The service role has no BYPASSRLS on RDS; instead it sets
 * `app.user_role = 'service'` and the policies grant it the narrow operations
 * it needs (user deletion, audit writes, invite seeding).
 */
export async function withService<T>(
  fn: (db: Db) => Promise<T>,
): Promise<T> {
  const client = await getServicePool().connect();
  try {
    await client.query("begin");
    await client.query("select set_config('app.user_id', '', true)");
    await client.query("select set_config('app.user_role', 'service', true)");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
