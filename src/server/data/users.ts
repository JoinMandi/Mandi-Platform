/** Data access — users. */
import type { Db } from "@/server/db/pool";
import { all, count, one, run } from "@/server/db/sql";
import type { UserRole, UserRow } from "@/lib/types/database";

export async function getUserRole(
  db: Db,
  userId: string,
): Promise<UserRole | null> {
  const row = await one<{ role: UserRole }>(
    db,
    `select role from web.users where id = $1`,
    [userId],
  );
  return row?.role ?? null;
}

export async function getUserAccount(
  db: Db,
  userId: string,
): Promise<{ role: UserRole; email: string | null } | null> {
  const row = await one<{ role: UserRole; email: string | null }>(
    db,
    `select role, email from web.users where id = $1`,
    [userId],
  );
  if (!row) return null;
  return { role: row.role, email: row.email ?? null };
}

export async function listUsers(db: Db): Promise<UserRow[]> {
  return all<UserRow>(db, `select * from web.users order by created_at desc`);
}

export async function countUsers(db: Db): Promise<number> {
  return count(db, `select count(*)::int as n from web.users`);
}

/**
 * Seeds (or refreshes) the profile row for a signed-in account. Deliberately
 * does not touch `role`; the trigger blocks elevation from app sessions.
 */
export async function seedUser(
  db: Db,
  input: { id: string; email: string | null; language_code: string | null },
): Promise<void> {
  await run(
    db,
    `insert into web.users (id, email, language_code)
     values ($1,$2,$3)
     on conflict (id) do update set
       email = excluded.email,
       language_code = coalesce(excluded.language_code, web.users.language_code)`,
    [input.id, input.email, input.language_code],
  );
}

/** Service-role-only: insert a profile with an explicit role (invite flow). */
export async function upsertUserWithRole(
  service: Db,
  input: {
    id: string;
    email: string | null;
    role: UserRole;
    languageCode: string | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await run(
      service,
      `insert into web.users (id, email, role, language_code)
       values ($1,$2,$3,$4)
       on conflict (id) do update set
         email = excluded.email,
         role = excluded.role,
         language_code = coalesce(excluded.language_code, web.users.language_code)`,
      [input.id, input.email, input.role, input.languageCode],
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Upsert failed",
    };
  }
}

/** Service-role-only: change a role. The DB trigger remains the backstop. */
export async function setUserRole(
  service: Db,
  userId: string,
  role: UserRole,
): Promise<void> {
  await run(service, `update web.users set role = $2 where id = $1`, [userId, role]);
}

/** Service-role-only: remove the profile row; health rows cascade. */
export async function deleteUserRow(service: Db, userId: string): Promise<void> {
  await run(service, `delete from web.users where id = $1`, [userId]);
}
