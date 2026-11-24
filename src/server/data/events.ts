/** Data access — events + event_translations. */
import { randomUUID } from "node:crypto";
import type { Db } from "@/server/db/pool";
import { all, count, run } from "@/server/db/sql";
import type { EventStatus } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

export interface EventFilters {
  status?: EventStatus;
  province?: string;
  format?: string;
}

function whereClause(filters: EventFilters, prefix = "e") {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`${prefix}.status = $${params.length}`);
  }
  if (filters.province) {
    params.push(filters.province);
    clauses.push(`${prefix}.province = $${params.length}`);
  }
  if (filters.format) {
    params.push(filters.format);
    clauses.push(`${prefix}.format = $${params.length}`);
  }
  return { where: clauses.length ? `where ${clauses.join(" and ")}` : "", params };
}

export async function listEvents(
  db: Db,
  filters: EventFilters = {},
): Promise<EventWithTranslations[]> {
  const { where, params } = whereClause(filters);
  return all<EventWithTranslations>(
    db,
    `select e.*,
            coalesce(
              json_agg(t.* order by t.created_at) filter (where t.id is not null),
              '[]'::json
            ) as event_translations
     from web.events e
     left join web.event_translations t on t.event_id = e.id
     ${where}
     group by e.id
     order by e.date asc nulls last`,
    params,
  );
}

export async function setEventStatus(
  db: Db,
  id: string,
  status: EventStatus,
): Promise<void> {
  await run(db, `update web.events set status = $2 where id = $1`, [id, status]);
}

export async function countPendingEvents(db: Db): Promise<number> {
  return count(db, `select count(*)::int as n from web.events where status = 'pending'`);
}

export async function listPublicEvents(db: Db): Promise<EventWithTranslations[]> {
  return all<EventWithTranslations>(
    db,
    `select e.*,
            coalesce(
              json_agg(t.* order by t.created_at) filter (where t.id is not null),
              '[]'::json
            ) as event_translations
     from web.events e
     left join web.event_translations t on t.event_id = e.id
     where e.status = 'published'
     group by e.id
     order by e.date asc nulls last`,
  );
}

export interface InsertEventInput {
  date: string | null;
  location: string | null;
  onlineUrl: string | null;
  host: string | null;
  free: boolean;
  cost: string | null;
  format: "inperson" | "online" | null;
  type: string | null;
  province: string | null;
  registrationUrl: string | null;
  status?: EventStatus;
}

export interface InsertEventTranslationInput {
  languageCode: string;
  name: string;
  description: string | null;
}

/** Insert the canonical event plus its first translation, atomically. */
export async function insertEvent(
  db: Db,
  event: InsertEventInput,
  translation: InsertEventTranslationInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const id = randomUUID();
  try {
    await run(
      db,
      `insert into web.events
         (id, date, location, online_url, host, free, cost, format, type,
          province, registration_url, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        id,
        event.date,
        event.location,
        event.onlineUrl,
        event.host,
        event.free,
        event.cost,
        event.format,
        event.type,
        event.province,
        event.registrationUrl,
        event.status ?? "pending",
      ],
    );
    await run(
      db,
      `insert into web.event_translations
         (event_id, language_code, name, description)
       values ($1,$2,$3,$4)`,
      [id, translation.languageCode, translation.name, translation.description],
    );
    return { ok: true, id };
  } catch (error) {
    // Best-effort cleanup so a failed translation does not leave an orphan.
    await run(db, `delete from web.events where id = $1`, [id]).catch(() => {});
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Insert failed",
    };
  }
}
