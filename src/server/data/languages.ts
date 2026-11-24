/** Data access — languages lookup table. */
import type { Db } from "@/server/db/pool";
import { all } from "@/server/db/sql";
import type { LanguageRow } from "@/lib/types/database";

export async function listEnabledLanguages(db: Db): Promise<LanguageRow[]> {
  return all<LanguageRow>(
    db,
    `select * from web.languages where enabled order by sort_order asc`,
  );
}
