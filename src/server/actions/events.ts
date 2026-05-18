"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { requireAdmin } from "@/server/auth";
import { listEvents, setEventStatus } from "@/server/data/events";
import type { EventStatus } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

export async function fetchEvents(): Promise<EventWithTranslations[]> {
  const db = createActionClient();
  await requireAdmin(db);
  return listEvents(db);
}

export async function updateEventStatus(
  id: string,
  status: EventStatus,
): Promise<void> {
  const db = createActionClient();
  await requireAdmin(db);
  await setEventStatus(db, id, status);
  revalidatePath("/admin/events");
}
