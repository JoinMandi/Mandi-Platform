"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { requireAdmin } from "@/server/auth";
import { insertStory, listStories, setStoryStatus } from "@/server/data/stories";
import { insertAuditLog } from "@/server/data/audit";
import type { StoryRow, StoryStatus } from "@/lib/types/database";

export async function fetchStories(): Promise<StoryRow[]> {
  const db = createActionClient();
  await requireAdmin(db);
  return listStories(db);
}

export async function updateStoryStatus(
  id: string,
  status: StoryStatus,
): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  await setStoryStatus(db, id, status);
  revalidatePath("/admin/stories");
}

export interface CreateStoryInput {
  content: string;
  authorName?: string;
  languageCode?: string;
  symptomTags?: string[];
  consent: boolean;
}

/**
 * Admin-authored story creation. Phase 20 — the admin pages were
 * moderation-only until now; this is the first in-app authoring path.
 * Goes through the same `pending` queue as user submissions (user
 * decision: uniform audit trail). The admin can approve their own
 * submission from the same page.
 */
export async function createStory(
  input: CreateStoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = createActionClient();
  let actor;
  try {
    actor = await requireAdmin(db);
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
  const result = await insertStory(db, {
    content,
    authorName: input.authorName?.trim() || null,
    languageCode: input.languageCode ?? "en",
    symptomTags:
      input.symptomTags && input.symptomTags.length > 0 ? input.symptomTags : null,
    consent: true,
    status: "pending",
  });
  if (!result.ok) return result;
  await insertAuditLog(createServiceClient(), {
    action: "story_create",
    actorId: actor.id,
    actorEmail: actor.email ?? null,
    targetId: result.id,
    meta: {
      author_name: input.authorName?.trim() ?? null,
      language: input.languageCode ?? "en",
    },
  });
  revalidatePath("/admin/stories");
  return { ok: true, id: result.id };
}
