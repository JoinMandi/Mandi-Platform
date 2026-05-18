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
