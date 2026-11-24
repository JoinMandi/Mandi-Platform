/** Data access — content + content_translations. */
import { randomUUID } from "node:crypto";
import type { Db } from "@/server/db/pool";
import { all, run } from "@/server/db/sql";
import type { ContentRow, ContentTranslationRow } from "@/lib/types/database";
import type { ContentWithTranslations } from "@/lib/types/models";

export type ContentCanonicalInput = Pick<
  ContentRow,
  "type" | "symptom_tags" | "persona_tags" | "published"
>;

export type ContentTranslationInput = Pick<
  ContentTranslationRow,
  "content_id" | "language_code" | "title" | "description" | "url" | "review_status"
>;

export async function listContent(db: Db): Promise<ContentWithTranslations[]> {
  return all<ContentWithTranslations>(
    db,
    `select c.*,
            coalesce(
              json_agg(t.* order by t.created_at) filter (where t.id is not null),
              '[]'::json
            ) as content_translations
     from web.content c
     left join web.content_translations t on t.content_id = c.id
     group by c.id
     order by c.created_at desc`,
  );
}

/** Client-generated id avoids INSERT … RETURNING (which re-applies SELECT RLS). */
export async function insertContent(
  db: Db,
  input: ContentCanonicalInput,
): Promise<string | null> {
  const id = randomUUID();
  const affected = await run(
    db,
    `insert into web.content (id, type, symptom_tags, persona_tags, published)
     values ($1,$2,$3,$4,$5)`,
    [id, input.type, input.symptom_tags, input.persona_tags, input.published],
  );
  return affected > 0 ? id : null;
}

export async function updateContent(
  db: Db,
  id: string,
  input: ContentCanonicalInput,
): Promise<void> {
  await run(
    db,
    `update web.content set
       type = $2, symptom_tags = $3, persona_tags = $4, published = $5
     where id = $1`,
    [id, input.type, input.symptom_tags, input.persona_tags, input.published],
  );
}

export async function deleteContent(db: Db, id: string): Promise<void> {
  await run(db, `delete from web.content where id = $1`, [id]);
}

export async function setContentPublished(
  db: Db,
  id: string,
  published: boolean,
): Promise<void> {
  await run(db, `update web.content set published = $2 where id = $1`, [
    id,
    published,
  ]);
}

export async function upsertContentTranslation(
  db: Db,
  input: ContentTranslationInput,
): Promise<void> {
  await run(
    db,
    `insert into web.content_translations
       (content_id, language_code, title, description, url, review_status)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (content_id, language_code) do update set
       title = excluded.title,
       description = excluded.description,
       url = excluded.url,
       review_status = excluded.review_status`,
    [
      input.content_id,
      input.language_code,
      input.title,
      input.description,
      input.url,
      input.review_status,
    ],
  );
}

export async function deleteContentTranslation(
  db: Db,
  id: string,
): Promise<void> {
  await run(db, `delete from web.content_translations where id = $1`, [id]);
}
