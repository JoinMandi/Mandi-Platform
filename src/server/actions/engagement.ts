"use server";

import { getSessionUser } from "@/server/auth";
import {
  insertEngagementEvent,
  type EngagementEventType,
} from "@/server/data/engagement";
import { withUser } from "@/server/db/withUser";

const ALLOWED: ReadonlySet<EngagementEventType> = new Set<EngagementEventType>([
  "doctor_view", "doctor_book_click", "content_view", "content_link_click",
  "event_view", "event_rsvp_click", "page_view", "questionnaire_start",
  "questionnaire_domain", "questionnaire_complete", "keep_submit",
]);

export async function logEngagement(input: {
  eventType: EngagementEventType;
  targetId?: string | null;
  sessionId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    if (!ALLOWED.has(input.eventType)) return;
    const user = await getSessionUser();
    await withUser(user ? { id: user.id, role: user.role } : null, (db) =>
      insertEngagementEvent(db, {
        event_type: input.eventType,
        user_id: user?.id ?? null,
        session_id: input.sessionId ?? null,
        target_id: input.targetId ?? null,
        meta: sanitiseMeta(input.meta ?? {}),
      }),
    );
  } catch {
    /* swallow — tracking must never break the UX */
  }
}

const META_ALLOWED_KEYS = new Set([
  "lang", "score_band", "persona", "format", "province", "source",
]);

function sanitiseMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (!META_ALLOWED_KEYS.has(k)) continue;
    if (typeof v === "string" && v.length <= 64) out[k] = v;
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}
