"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth";
import { withUser } from "@/server/db/withUser";
import { withService } from "@/server/db/withUser";
import { insertEvent, listEvents, setEventStatus } from "@/server/data/events";
import { insertAuditLog } from "@/server/data/audit";
import type { EventStatus } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

export async function fetchEvents(): Promise<EventWithTranslations[]> {
  const actor = await requireAdmin();
  return withUser({ id: actor.id, role: actor.role }, (db) => listEvents(db));
}

export async function updateEventStatus(
  id: string,
  status: EventStatus,
): Promise<void> {
  const actor = await requireAdmin();
  await withUser({ id: actor.id, role: actor.role }, (db) =>
    setEventStatus(db, id, status),
  );
  revalidatePath("/admin/events");
}

export interface CreateEventInput {
  date: string;
  host: string;
  location?: string;
  onlineUrl?: string;
  format: "inperson" | "online";
  province?: string;
  type?: string;
  free: boolean;
  cost?: string;
  registrationUrl?: string;
  name: string;
  description?: string;
}

export async function createEvent(
  input: CreateEventInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  let actor;
  try {
    actor = await requireAdmin();
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

  const result = await withUser({ id: actor.id, role: actor.role }, (db) =>
    insertEvent(
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
    ),
  );
  if (!result.ok) return result;

  await withService((db) =>
    insertAuditLog(db, {
      action: "event_create",
      actorId: actor.id,
      actorEmail: actor.email,
      targetId: result.id,
      meta: { name, host, format: input.format, date: input.date },
    }),
  );
  revalidatePath("/admin/events");
  return { ok: true, id: result.id };
}
