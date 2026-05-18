"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { requireAdmin } from "@/server/auth";
import { listStories, setStoryStatus } from "@/server/data/stories";
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
