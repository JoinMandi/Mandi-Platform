/** Data access — events + event_translations. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventStatus } from "@/lib/types/database";
import type { EventWithTranslations } from "@/lib/types/models";

export interface EventFilters {
  status?: EventStatus;
  province?: string;
  format?: string;
}

export async function listEvents(
  db: SupabaseClient,
  filters: EventFilters = {},
): Promise<EventWithTranslations[]> {
  let q = db
    .from("events")
    .select("*, event_translations(*)")
    .order("date", { ascending: true });
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.province) q = q.eq("province", filters.province);
  if (filters.format) q = q.eq("format", filters.format);
  const { data } = await q;
  return (data ?? []) as EventWithTranslations[];
}

export async function setEventStatus(
  db: SupabaseClient,
  id: string,
  status: EventStatus,
): Promise<void> {
  await db.from("events").update({ status }).eq("id", id);
}

export async function countPendingEvents(db: SupabaseClient): Promise<number> {
  const { count } = await db
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export interface InsertEventInput {
  date: string | null;
  location: string | null;
  onlineUrl: string | null;
  host: string | null;
  free: boolean;
  cost: string | null;
  format: "inperson" | "online" | null;
  type: string | null;
  province: string | null;
  registrationUrl: string | null;
  /** Defaults to 'pending' — admin-created events still flow through the
   *  moderation queue per the Phase-20 user decision. */
  status?: EventStatus;
}

export interface InsertEventTranslationInput {
  languageCode: string;
  name: string;
  description: string | null;
}

/** Insert a new event together with at least one translation row (the
 *  events table doesn't carry name/description columns — those live in
 *  event_translations). If the translation insert fails, the canonical
 *  events row is deleted to avoid orphaned listings. */
export async function insertEvent(
  db: SupabaseClient,
  event: InsertEventInput,
  translation: InsertEventTranslationInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { data: eventRow, error: eventErr } = await db
    .from("events")
    .insert({
      date: event.date,
      location: event.location,
      online_url: event.onlineUrl,
      host: event.host,
      free: event.free,
      cost: event.cost,
      format: event.format,
      type: event.type,
      province: event.province,
      registration_url: event.registrationUrl,
      status: event.status ?? "pending",
    })
    .select("id")
    .single();
  if (eventErr || !eventRow) {
    return { ok: false, error: eventErr?.message ?? "Insert returned no row" };
  }
  const id = (eventRow as { id: string }).id;
  const { error: trErr } = await db.from("event_translations").insert({
    event_id: id,
    language_code: translation.languageCode,
    name: translation.name,
    description: translation.description,
  });
  if (trErr) {
    // Rollback the canonical row so we don't leave an orphan event with
    // no displayable name. Best-effort — if the delete fails, log it for
    // the admin to clean up manually.
    await db.from("events").delete().eq("id", id);
    return { ok: false, error: `Translation insert failed: ${trErr.message}` };
  }
  return { ok: true, id };
}
