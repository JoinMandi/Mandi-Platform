"use server";

import { revalidatePath } from "next/cache";
import { createActionClient } from "@/server/supabase/server";
import { createServiceClient } from "@/server/supabase/service";
import { requireAdmin } from "@/server/auth";
import { insertEvent, listEvents, setEventStatus } from "@/server/data/events";
import { insertAuditLog } from "@/server/data/audit";
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

export interface CreateEventInput {
  /** ISO timestamp of the event. */
  date: string;
  host: string;
  /** Free-text venue / address — required for inperson + both. */
  location?: string;
  /** Online-meeting URL — required for online + both. */
  onlineUrl?: string;
  format: "inperson" | "online";
  province?: string;
  type?: string;
  free: boolean;
  cost?: string;
  registrationUrl?: string;
  /** Canonical English title + description. Translations into other
   *  languages can be added via the admin Content surface (post-MVP). */
  name: string;
  description?: string;
}

/**
 * Admin-authored event creation. Phase 20 — first in-app authoring
 * path for events. Still goes through the `pending` queue per user
 * decision. NOTE: the public `/events` page is currently hardcoded
 * (Phase 21 flag); admin-created events won't show publicly until
 * that page reads from the events table.
 */
export async function createEvent(
  input: CreateEventInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const db = createActionClient();
  let actor;
  try {
    actor = await requireAdmin(db);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
  const name = input.name.trim();
  const host = input.host.trim();
  if (!name) return { ok: false, error: "Event name is required." };
  if (!host) return { ok: false, error: "Host is required." };
  if (!input.date) return { ok: false, error: "Event date is required." };
  if (input.format === "inperson" && !input.location?.trim()) {
    return { ok: false, error: "Location is required for in-person events." };
  }
  if (input.format === "online" && !input.onlineUrl?.trim()) {
    return { ok: false, error: "Online meeting URL is required for online events." };
  }

  const result = await insertEvent(
    db,
    {
      date: input.date,
      host,
      location: input.location?.trim() || null,
      onlineUrl: input.onlineUrl?.trim() || null,
      format: input.format,
      province: input.province?.trim() || null,
      type: input.type?.trim() || null,
      free: input.free,
      cost: input.free ? null : input.cost?.trim() || null,
      registrationUrl: input.registrationUrl?.trim() || null,
      status: "pending",
    },
    {
      languageCode: "en",
      name,
      description: input.description?.trim() || null,
    },
  );
  if (!result.ok) return result;

  await insertAuditLog(createServiceClient(), {
    action: "event_create",
    actorId: actor.id,
    actorEmail: actor.email ?? null,
    targetId: result.id,
    meta: {
      name,
      host,
      format: input.format,
      date: input.date,
    },
  });
  revalidatePath("/admin/events");
  return { ok: true, id: result.id };
}
