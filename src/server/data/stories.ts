/** Data access — stories. */
import { randomUUID } from "node:crypto";
import type { Db } from "@/server/db/pool";
import { all, count, run } from "@/server/db/sql";
import type { StoryRow, StoryStatus } from "@/lib/types/database";

export interface StoryFilters {
  status?: StoryStatus;
  languageCode?: string;
}

export async function listStories(
  db: Db,
  filters: StoryFilters = {},
): Promise<StoryRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`status = $${params.length}`);
  }
  if (filters.languageCode) {
    params.push(filters.languageCode);
    clauses.push(`language_code = $${params.length}`);
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  return all<StoryRow>(
    db,
    `select * from web.stories ${where} order by created_at desc`,
    params,
  );
}

export async function setStoryStatus(
  db: Db,
  id: string,
  status: StoryStatus,
): Promise<void> {
  await run(db, `update web.stories set status = $2 where id = $1`, [id, status]);
}

export async function countPendingStories(db: Db): Promise<number> {
  return count(db, `select count(*)::int as n from web.stories where status = 'pending'`);
}

export interface InsertStoryInput {
  content: string;
  authorName: string | null;
  languageCode: string | null;
  symptomTags: string[] | null;
  consent: boolean;
  status?: StoryStatus;
}

/**
 * Insert a story. The id is generated here rather than with RETURNING: the
 * table's SELECT policy is admin/approved-only, so an anonymous insert that
 * asked for the row back would be refused.
 */
export async function insertStory(
  db: Db,
  input: InsertStoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const id = randomUUID();
  try {
    await run(
      db,
      `insert into web.stories
         (id, content, author_name, language_code, symptom_tags, consent, status)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        input.content,
        input.authorName,
        input.languageCode,
        input.symptomTags,
        input.consent,
        input.status ?? "pending",
      ],
    );
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Insert failed",
    };
  }
}
