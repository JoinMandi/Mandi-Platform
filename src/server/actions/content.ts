"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
import {
  listContent,
  insertContent,
  updateContent,
  deleteContent,
  setContentPublished,
  upsertContentTranslation,
  deleteContentTranslation,
} from "@/server/data/content";
import type { ContentType, ReviewStatus } from "@/lib/types/database";
import type { ContentWithTranslations } from "@/lib/types/models";

type TranslationDraft = {
  language_code: string;
  title: string;
  description: string;
  url: string;
  review_status: ReviewStatus;
  existingId: string | null;
};

export async function fetchContent(): Promise<ContentWithTranslations[]> {
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listContent(db));
}

export async function saveContent(args: {
  id: string | null;
  type: ContentType;
  symptom_tags: string[];
  persona_tags: string[];
  published: boolean;
  translations: TranslationDraft[];
}): Promise<void> {
  const actor = await requireAdmin();
  const canonical = {
    type: args.type,
    symptom_tags: args.symptom_tags,
    persona_tags: args.persona_tags,
    published: args.published,
  };

  await withUser({ id: actor.id, role: actor.role }, async (db) => {
    let contentId = args.id;
    if (contentId) {
      await updateContent(db, contentId, canonical);
    } else {
      contentId = await insertContent(db, canonical);
    }
    if (!contentId) return;

    for (const tr of args.translations) {
      const title = tr.title.trim();
      if (title) {
        await upsertContentTranslation(db, {
          content_id: contentId,
          language_code: tr.language_code,
          title,
          description: tr.description.trim() || null,
          url: tr.url.trim() || null,
          review_status: tr.review_status,
        });
      } else if (tr.existingId) {
        await deleteContentTranslation(db, tr.existingId);
      }
    }
  });

  revalidatePath("/admin/content");
}

export async function removeContent(id: string): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) => deleteContent(db, id));
  revalidatePath("/admin/content");
}

export async function toggleContentPublished(
  id: string,
  published: boolean,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) =>
    setContentPublished(db, id, published),
  );
  revalidatePath("/admin/content");
}
