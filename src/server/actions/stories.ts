"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { withService, withUser } from "@/server/db/withUser";
import { insertStory, listStories, setStoryStatus } from "@/server/data/stories";
import { insertAuditLog } from "@/server/data/audit";
import type { StoryRow, StoryStatus } from "@/lib/types/database";

export async function fetchStories(): Promise<StoryRow[]> {
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listStories(db));
}

export async function updateStoryStatus(
  id: string,
  status: StoryStatus,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) =>
    setStoryStatus(db, id, status),
  );
  revalidatePath("/admin/stories");
}

export interface CreateStoryInput {
  content: string;
  authorName?: string;
  languageCode?: string;
  symptomTags?: string[];
  consent: boolean;
}

export async function createStory(
  input: CreateStoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  if (!input.consent) {
    return { ok: false, error: "Consent confirmation is required." };
  }
  const content = input.content.trim();
  if (!content) {
    return { ok: false, error: "Story content cannot be empty." };
  }

  const result = await withUser({ id: actor.id, role: actor.role }, (db) =>
    insertStory(db, {
      content,
      authorName: input.authorName?.trim() || null,
      languageCode: input.languageCode ?? "en",
      symptomTags:
        input.symptomTags && input.symptomTags.length > 0 ? input.symptomTags : null,
      consent: true,
      status: "pending",
    }),
  );
  if (!result.ok) return result;

  await withService((db) =>
    insertAuditLog(db, {
      action: "story_create",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: result.id,
      meta: {
        author_name: input.authorName?.trim() ?? null,
        language: input.languageCode ?? "en",
      },
    }),
  );
  revalidatePath("/admin/stories");
  return { ok: true, id: result.id };
}
