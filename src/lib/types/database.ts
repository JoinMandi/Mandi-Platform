/**
 * Database row types — mirror `supabase/schema.sql` (Pass B).
 *
 * Hand-written because the Supabase project is not yet provisioned. Once it is,
 * regenerate precisely with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 *
 * This is the SINGLE source of truth for table shapes. Never redefine row types
 * inside components, pages, or the data layer — import them from here.
 */

// ── Enum-like string unions (mirror CHECK constraints) ───────────
export type UserRole = "member" | "clinician" | "admin" | "superadmin";
export type ContentType = "article" | "video" | "podcast";
export type ReviewStatus = "draft" | "in_review" | "approved";
export type ScoreBand = "mild" | "moderate" | "significant";
export type Persona =
  | "sally" | "olga" | "vicky" | "nelly" | "nina" | "retha" | "colleen";
/** Legacy questionnaire-derived symptom domains. Used by Phase 1–20 logs
 *  AND by per-user analytics (admin EngagementHeatmap). Kept for backward
 *  compatibility so existing rows still type-check. */
export type SymptomDomain =
  | "mind-cognition" | "mood" | "nervous-system" | "body"
  | "urogenital" | "other" | "quality-of-life";

/** Phase 21: the concrete day-to-day symptoms /my-journey logs against
 *  the same `symptom_logs.domain` column. The column has had its CHECK
 *  constraint dropped (see supabase/schema.sql), so both old and new
 *  values coexist on the same column. */
export type TrackerSymptom =
  | "hot-flushes"
  | "sleep"
  | "mood"
  | "brain-fog"
  | "vaginal-discomfort"
  | "joint-pain"
  | "anxiety"
  | "energy";
export type EventFormat = "inperson" | "online";
export type ClinicFormat = "online" | "inperson" | "both";
export type StoryStatus = "pending" | "approved" | "rejected";
export type EventStatus = "pending" | "approved" | "published";
export type CheckinType = "6week" | "3month";
export type RiskBand = "low" | "moderate" | "high";
export type FeedbackRating = "yes" | "mostly" | "not-quite";

// ── Table rows ───────────────────────────────────────────────────
export interface LanguageRow {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
  sort_order: number;
}

export interface SessionRow {
  id: string;
  created_at: string;
  language_code: string | null;
  popia_consent: boolean;
  popia_consent_at: string | null;
}

export interface UserRow {
  id: string;
  email: string | null;
  language_code: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface QuestionnaireResponseRow {
  id: string;
  session_id: string | null;
  user_id: string | null;
  language_code: string | null;
  answers: Record<string, unknown> | null;
  meno_score: number | null;
  score_band: ScoreBand | null;
  persona: Persona | null;
  self_harm_flag: boolean;
  colleen_flag: boolean;
  top_domains: string[] | null;
  completed_at: string;
}

export interface ContentRow {
  id: string;
  type: ContentType | null;
  symptom_tags: string[] | null;
  persona_tags: string[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentTranslationRow {
  id: string;
  content_id: string;
  language_code: string;
  title: string;
  description: string | null;
  url: string | null;
  review_status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ClinicRow {
  id: string;
  name: string;
  practice: string | null;
  province: string | null;
  languages: string[] | null;
  format: ClinicFormat | null;
  contact: string | null;
  booking_url: string | null;
  hrt_friendly: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorRow {
  id: string;
  name: string;
  practice: string | null;
  photo_url: string | null;
  bio: string | null;
  languages: string[] | null;
  booking_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryRow {
  id: string;
  session_id: string | null;
  user_id: string | null;
  content: string;
  author_name: string | null;
  language_code: string | null;
  symptom_tags: string[] | null;
  consent: boolean;
  status: StoryStatus;
  created_at: string;
  updated_at: string;
}

export interface EventRow {
  id: string;
  date: string | null;
  location: string | null;
  online_url: string | null;
  host: string | null;
  free: boolean;
  cost: string | null;
  format: EventFormat | null;
  type: string | null;
  province: string | null;
  registration_url: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
}

export interface EventTranslationRow {
  id: string;
  event_id: string;
  language_code: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapFeedbackRow {
  id: string;
  session_id: string | null;
  feels_right: FeedbackRating | null;
  missing_content: string | null;
  created_at: string;
}

export interface CheckinRow {
  id: string;
  user_id: string | null;
  type: CheckinType | null;
  original_response_id: string | null;
  new_response_id: string | null;
  action_taken: string | null;
  open_response: string | null;
  completed_at: string | null;
}

export interface SymptomLogRow {
  id: string;
  user_id: string | null;
  logged_date: string;
  /** Phase 21: was `SymptomDomain | null`. Loosened to `string | null`
   *  to accept both the legacy `SymptomDomain` values and the new
   *  `TrackerSymptom` values now that /my-journey writes the new ones. */
  domain: string | null;
  score: number | null;
  created_at: string;
}

export interface ClinicalScreeningRow {
  id: string;
  clinician_id: string | null;
  patient_reference: string | null;
  language_code: string | null;
  answers: Record<string, unknown> | null;
  score: number | null;
  risk_band: RiskBand | null;
  referral_recommended: boolean;
  clinician_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PopiaDeletionLogRow {
  id: string;
  deleted_at: string;
  user_email: string | null;
  deleted_by: string | null;
}

export type EngagementEventType =
  | "doctor_view"
  | "doctor_book_click"
  | "content_view"
  | "content_link_click"
  | "event_view"
  | "event_rsvp_click";

export interface EngagementEventRow {
  id: number;
  created_at: string;
  event_type: EngagementEventType;
  user_id: string | null;
  session_id: string | null;
  target_id: string | null;
  meta: Record<string, unknown> | null;
}

/** Admin-action audit log. Service-role inserts only; superadmin (AAL2)
 *  reads. `user_view` is the high-volume POPIA-trail action — fires on
 *  every /admin/users/[id] open. `story_create` / `event_create` fire
 *  when an admin authors content directly (Phase 20). */
export type AdminAuditAction =
  | "role_change"
  | "user_invite"
  | "user_delete"
  | "user_view"
  | "story_create"
  | "story_status"
  | "event_create"
  | "event_status"
  | "content_publish"
  | "content_translation_upsert"
  | "clinic_save"
  | "doctor_save";

export interface AdminAuditLogRow {
  id: number;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: AdminAuditAction;
  target_id: string | null;
  meta: Record<string, unknown> | null;
}
