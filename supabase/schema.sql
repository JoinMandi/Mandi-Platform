-- ═════════════════════════════════════════════════════════════
-- JoinMandi — Database schema (Pass B)
-- Multilingual-first revision. Run top to bottom in the Supabase SQL editor.
-- Re-runnable: tables use IF NOT EXISTS; functions/policies/triggers are dropped first.
-- ═════════════════════════════════════════════════════════════

-- 1. Extensions -------------------------------------------------
create extension if not exists "pgcrypto";

-- ═════════════════════════════════════════════════════════════
-- 2. Tables
-- ═════════════════════════════════════════════════════════════

-- languages — lookup table. Adding a new language is an INSERT, not a migration.
create table if not exists languages (
  code         text primary key,            -- 'en','zu','xh','af', … (ISO 639-1)
  name         text not null,               -- English name
  native_name  text not null,               -- endonym
  enabled      boolean default true,
  sort_order   integer default 0
);

insert into languages (code, name, native_name, sort_order) values
  ('en','English','English',1),
  ('zu','isiZulu','isiZulu',2),
  ('xh','isiXhosa','isiXhosa',3),
  ('af','Afrikaans','Afrikaans',4)
on conflict (code) do nothing;

-- sessions — anonymous + logged-in session, language + POPIA consent
create table if not exists sessions (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz default now(),
  language_code      text references languages(code),
  popia_consent      boolean default false,
  popia_consent_at   timestamptz
);

-- users — mirror of auth.users with role + language preference.
-- 'superadmin' is the top tier — only superadmins can mint/demote admins
-- or other superadmins. is_admin() (below) treats superadmin as a
-- superset of admin so every admin-gated RLS policy applies automatically.
create table if not exists users (
  id             uuid primary key references auth.users(id) on delete cascade,
  email          text,
  language_code  text references languages(code),
  role           text not null default 'member'
                   check (role in ('member','clinician','admin','superadmin')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
-- If you previously ran an earlier version of this schema, drop the old
-- check constraint and re-add the wider one (idempotent / safe to re-run):
do $$ begin
  alter table public.users drop constraint if exists users_role_check;
  alter table public.users add constraint users_role_check
    check (role in ('member','clinician','admin','superadmin'));
end $$;

-- questionnaire_responses — the 56-question consumer symptom questionnaire
create table if not exists questionnaire_responses (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid references sessions(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete cascade,
  language_code    text references languages(code),
  answers          jsonb,
  meno_score       integer check (meno_score between 0 and 100),
  score_band       text    check (score_band in ('mild','moderate','significant')),
  persona          text    check (persona in ('sally','olga','vicky','nelly','nina','retha','colleen')),
  self_harm_flag   boolean default false,
  colleen_flag     boolean default false,
  top_domains      text[],
  completed_at     timestamptz default now()
);

-- content — canonical, language-neutral editorial item
create table if not exists content (
  id            uuid primary key default gen_random_uuid(),
  type          text check (type in ('article','video','podcast')),
  symptom_tags  text[],
  persona_tags  text[],
  published     boolean default false,        -- master visibility switch
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- content_translations — one row per language for a content item
create table if not exists content_translations (
  id             uuid primary key default gen_random_uuid(),
  content_id     uuid not null references content(id) on delete cascade,
  language_code  text not null references languages(code),
  title          text not null,
  description    text,
  url            text,                         -- per-language (e.g. localised video)
  review_status  text not null default 'draft'
                   check (review_status in ('draft','in_review','approved')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (content_id, language_code)
);

-- clinic_directory — HRT-friendly clinics. `languages` = languages spoken there.
create table if not exists clinic_directory (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  practice      text,
  province      text,
  languages     text[],
  format        text check (format in ('online','inperson','both')),
  contact       text,
  booking_url   text,
  hrt_friendly  boolean default true,
  published     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- doctor_profiles — featured practitioners. `languages` = languages spoken.
create table if not exists doctor_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  practice    text,
  photo_url   text,
  bio         text,
  languages   text[],
  booking_url text,
  published   boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- stories — user-submitted testimonials. Authored once, in one language.
create table if not exists stories (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid references sessions(id) on delete set null,
  user_id        uuid references auth.users(id) on delete set null,
  content        text not null,
  author_name    text,
  language_code  text references languages(code),
  symptom_tags   text[],
  consent        boolean default false,
  status         text default 'pending' check (status in ('pending','approved','rejected')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- events — canonical, language-neutral event logistics
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  date              timestamptz,
  location          text,
  online_url        text,
  host              text,
  free              boolean default true,
  cost              text,
  format            text check (format in ('inperson','online')),
  type              text,
  province          text,
  registration_url  text,
  status            text default 'pending' check (status in ('pending','approved','published')),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- event_translations — localised name + description per language
create table if not exists event_translations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  language_code  text not null references languages(code),
  name           text not null,
  description    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (event_id, language_code)
);

-- roadmap_feedback — feedback on a generated roadmap
create table if not exists roadmap_feedback (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid references sessions(id) on delete cascade,
  feels_right       text check (feels_right in ('yes','mostly','not-quite')),
  missing_content   text,
  created_at        timestamptz default now()
);

-- checkins — 6-week and 3-month follow-ups
create table if not exists checkins (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade,
  type                  text check (type in ('6week','3month')),
  original_response_id  uuid references questionnaire_responses(id) on delete cascade,
  new_response_id       uuid references questionnaire_responses(id) on delete set null,
  action_taken          text,
  open_response         text,
  completed_at          timestamptz
);

-- symptom_logs — My Journey daily tracker.
-- Phase 21: dropped the CHECK constraint on `domain`. The column now
-- accepts both legacy questionnaire-domain values (mind-cognition,
-- mood, nervous-system, body, urogenital, other, quality-of-life) AND
-- the new /my-journey tracker symptom values (hot-flushes, sleep,
-- mood, brain-fog, vaginal-discomfort, joint-pain, anxiety, energy).
-- App-layer validates; no enum constraint needed.
create table if not exists symptom_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  logged_date  date not null,
  domain       text,
  score        integer check (score between 0 and 3),
  created_at   timestamptz default now(),
  unique (user_id, logged_date, domain)
);
-- Drop the legacy CHECK constraint from earlier schema versions
-- (idempotent — safe to re-run).
do $$ begin
  alter table public.symptom_logs drop constraint if exists symptom_logs_domain_check;
end $$;

-- clinical_screenings — MenoScreen by Mandi (clinician-administered).
-- POPIA: stores NO patient PII. `patient_reference` is an opaque clinician label.
create table if not exists clinical_screenings (
  id                    uuid primary key default gen_random_uuid(),
  clinician_id          uuid references auth.users(id) on delete cascade,
  patient_reference     text,
  language_code         text references languages(code),
  answers               jsonb,
  score                 integer,
  risk_band             text check (risk_band in ('low','moderate','high')),
  referral_recommended  boolean default false,
  clinician_notes       text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- popia_deletion_log — audit trail kept after a user row is wiped
create table if not exists popia_deletion_log (
  id           uuid primary key default gen_random_uuid(),
  deleted_at   timestamptz default now(),
  user_email   text,
  deleted_by   uuid references auth.users(id) on delete set null
);

-- ═════════════════════════════════════════════════════════════
-- 3. Functions
-- ═════════════════════════════════════════════════════════════

-- Stamps updated_at on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role helpers — used by RLS. is_admin keeps its name so existing policy
-- references stay valid; its body checks for BOTH admin and superadmin so
-- superadmin is a strict superset of admin and inherits every admin RLS
-- grant automatically (no policy rewrites needed).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin','superadmin') from public.users where id = auth.uid()),
    false
  );
$$;

-- Strict superadmin check — used by the role-protection trigger and the
-- app-layer requireSuperadmin guard for privileged-tier mutations.
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'superadmin' from public.users where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_clinician()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select role = 'clinician' from public.users where id = auth.uid()), false);
$$;

grant execute on function public.is_admin()      to anon, authenticated;
grant execute on function public.is_superadmin() to anon, authenticated;
grant execute on function public.is_clinician()  to anon, authenticated;

-- Prevents privilege escalation, three layers:
--  1) Authenticated non-admin sessions cannot change role at all.
--  2) Setting role TO admin or superadmin requires a superadmin session
--     (i.e. admins cannot mint admins or superadmins).
--  3) Demoting AWAY from superadmin requires a superadmin session, AND
--     refuses to demote the LAST remaining superadmin (last-line lock-out
--     safeguard).
-- A null auth.uid() (SQL editor / service_role) bypasses all three — the
-- bootstrap UPDATE and the service-role invite path must keep working.
create or replace function public.protect_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    -- (1) Non-admin sessions: revert any role change.
    if not public.is_admin() then
      new.role := old.role;
      return new;
    end if;
    -- (2) Only superadmin can mint admin or superadmin.
    if new.role in ('admin','superadmin') and not public.is_superadmin() then
      new.role := old.role;
      return new;
    end if;
    -- (3a) Only superadmin can demote a superadmin.
    if old.role = 'superadmin' and not public.is_superadmin() then
      new.role := old.role;
      return new;
    end if;
    -- (3b) Refuse to demote the last superadmin.
    if old.role = 'superadmin' and new.role <> 'superadmin'
       and (select count(*) from public.users where role = 'superadmin') <= 1 then
      new.role := old.role;
      return new;
    end if;
  end if;
  return new;
end;
$$;

-- Bootstrap (one-time, in the Supabase SQL editor — null auth.uid() in the
-- editor bypasses the trigger above):
--   update public.users set role = 'superadmin'
--   where email = 'you@example.com';
-- Then reload /admin/users — the Superadmin badge appears and the role
-- dropdown for other users surfaces admin + superadmin options.

-- ═════════════════════════════════════════════════════════════
-- 4. Triggers
-- ═════════════════════════════════════════════════════════════

drop trigger if exists trg_users_updated                 on users;
drop trigger if exists trg_content_updated               on content;
drop trigger if exists trg_content_translations_updated   on content_translations;
drop trigger if exists trg_clinic_directory_updated       on clinic_directory;
drop trigger if exists trg_doctor_profiles_updated        on doctor_profiles;
drop trigger if exists trg_stories_updated                on stories;
drop trigger if exists trg_events_updated                 on events;
drop trigger if exists trg_event_translations_updated     on event_translations;
drop trigger if exists trg_clinical_screenings_updated    on clinical_screenings;

create trigger trg_users_updated               before update on users                for each row execute function public.set_updated_at();
create trigger trg_content_updated             before update on content              for each row execute function public.set_updated_at();
create trigger trg_content_translations_updated before update on content_translations for each row execute function public.set_updated_at();
create trigger trg_clinic_directory_updated     before update on clinic_directory     for each row execute function public.set_updated_at();
create trigger trg_doctor_profiles_updated      before update on doctor_profiles      for each row execute function public.set_updated_at();
create trigger trg_stories_updated              before update on stories              for each row execute function public.set_updated_at();
create trigger trg_events_updated               before update on events               for each row execute function public.set_updated_at();
create trigger trg_event_translations_updated   before update on event_translations   for each row execute function public.set_updated_at();
create trigger trg_clinical_screenings_updated  before update on clinical_screenings  for each row execute function public.set_updated_at();

drop trigger if exists trg_protect_user_role on users;
create trigger trg_protect_user_role before update on users
  for each row execute function public.protect_user_role();

-- ═════════════════════════════════════════════════════════════
-- 5. Indexes
-- ═════════════════════════════════════════════════════════════

create index if not exists idx_qr_session     on questionnaire_responses(session_id);
create index if not exists idx_qr_user        on questionnaire_responses(user_id);
create index if not exists idx_qr_persona     on questionnaire_responses(persona);
create index if not exists idx_stories_status on stories(status);
create index if not exists idx_stories_lang   on stories(language_code);
create index if not exists idx_events_status   on events(status);
create index if not exists idx_events_province on events(province);
create index if not exists idx_events_date     on events(date);
create index if not exists idx_checkins_user   on checkins(user_id);
create index if not exists idx_symptom_logs_user_date on symptom_logs(user_id, logged_date);
create index if not exists idx_content_published on content(published) where published;
create index if not exists idx_clinic_published  on clinic_directory(published) where published;
create index if not exists idx_doctor_published  on doctor_profiles(published) where published;
create index if not exists idx_content_tr_content on content_translations(content_id);
create index if not exists idx_content_tr_lang    on content_translations(language_code);
create index if not exists idx_event_tr_event     on event_translations(event_id);
create index if not exists idx_screenings_clinician on clinical_screenings(clinician_id);

-- ═════════════════════════════════════════════════════════════
-- 6. Row Level Security
-- ═════════════════════════════════════════════════════════════

alter table languages               enable row level security;
alter table sessions                enable row level security;
alter table users                   enable row level security;
alter table questionnaire_responses  enable row level security;
alter table content                 enable row level security;
alter table content_translations    enable row level security;
alter table clinic_directory         enable row level security;
alter table doctor_profiles          enable row level security;
alter table stories                  enable row level security;
alter table events                   enable row level security;
alter table event_translations       enable row level security;
alter table roadmap_feedback          enable row level security;
alter table checkins                  enable row level security;
alter table symptom_logs               enable row level security;
alter table clinical_screenings       enable row level security;
alter table popia_deletion_log        enable row level security;

-- ═════════════════════════════════════════════════════════════
-- 7. Policies
-- service_role bypasses RLS automatically; everything below is for anon + authenticated.
-- ═════════════════════════════════════════════════════════════

-- languages: world-readable; admins manage
drop policy if exists "languages_read_all"  on languages;
drop policy if exists "languages_admin_all" on languages;
create policy "languages_read_all"  on languages for select using (true);
create policy "languages_admin_all" on languages for all
  using (public.is_admin()) with check (public.is_admin());

-- sessions: anonymous insert (consent screen), open select
drop policy if exists "sessions_insert_any"  on sessions;
drop policy if exists "sessions_select_own"  on sessions;
create policy "sessions_insert_any" on sessions for insert with check (true);
create policy "sessions_select_own" on sessions for select using (true);

-- questionnaire_responses: insert for anyone; read own only
drop policy if exists "qr_insert_any" on questionnaire_responses;
drop policy if exists "qr_select_own" on questionnaire_responses;
drop policy if exists "qr_admin_read" on questionnaire_responses;
-- Bind inserts to the caller: authenticated users may only write their own
-- row; anonymous funnel submissions (no session) use a null user_id.
create policy "qr_insert_any" on questionnaire_responses for insert
  with check (user_id = auth.uid() or user_id is null);
-- Anonymous rows are NOT readable back: the roadmap is served from the
-- client's localStorage, so nothing needs them, and `or user_id is null`
-- would expose every anonymous health row to any anon-key caller.
create policy "qr_select_own" on questionnaire_responses for select
  using (user_id = auth.uid());
create policy "qr_admin_read" on questionnaire_responses for select using (public.is_admin());

-- users: manage own row (role changes are blocked by trg_protect_user_role)
drop policy if exists "users_select_own"   on users;
drop policy if exists "users_insert_own"   on users;
drop policy if exists "users_update_own"   on users;
drop policy if exists "users_admin_read"   on users;
drop policy if exists "users_admin_delete" on users;
create policy "users_select_own"   on users for select using (id = auth.uid());
create policy "users_insert_own"   on users for insert with check (id = auth.uid());
create policy "users_update_own"   on users for update using (id = auth.uid());
create policy "users_admin_read"   on users for select using (public.is_admin() or id = auth.uid());
create policy "users_admin_delete" on users for delete using (public.is_admin());

-- content (canonical): public reads published; admins manage + read drafts
drop policy if exists "content_read_published" on content;
drop policy if exists "content_admin_all"      on content;
drop policy if exists "content_admin_read"     on content;
create policy "content_read_published" on content for select using (published = true);
create policy "content_admin_all"  on content for all
  using (public.is_admin()) with check (public.is_admin());
create policy "content_admin_read" on content for select using (public.is_admin());

-- content_translations: public reads only approved translations of published items
drop policy if exists "content_tr_read_public" on content_translations;
drop policy if exists "content_tr_admin_all"   on content_translations;
create policy "content_tr_read_public" on content_translations for select
  using (
    review_status = 'approved'
    and exists (select 1 from content c where c.id = content_id and c.published)
  );
create policy "content_tr_admin_all" on content_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- clinic_directory / doctor_profiles: public reads published; admins manage
drop policy if exists "clinic_read_published" on clinic_directory;
drop policy if exists "clinic_admin_all"      on clinic_directory;
drop policy if exists "clinic_admin_read"     on clinic_directory;
create policy "clinic_read_published" on clinic_directory for select using (published = true);
create policy "clinic_admin_all"  on clinic_directory for all
  using (public.is_admin()) with check (public.is_admin());
create policy "clinic_admin_read" on clinic_directory for select using (public.is_admin());

drop policy if exists "doctor_read_published" on doctor_profiles;
drop policy if exists "doctor_admin_all"      on doctor_profiles;
drop policy if exists "doctor_admin_read"     on doctor_profiles;
create policy "doctor_read_published" on doctor_profiles for select using (published = true);
create policy "doctor_admin_all"  on doctor_profiles for all
  using (public.is_admin()) with check (public.is_admin());
create policy "doctor_admin_read" on doctor_profiles for select using (public.is_admin());

-- stories: anyone submits; public sees approved; admins moderate
drop policy if exists "stories_insert_any"  on stories;
drop policy if exists "stories_read_public" on stories;
drop policy if exists "stories_admin_all"   on stories;
create policy "stories_insert_any"  on stories for insert with check (true);
create policy "stories_read_public" on stories for select using (status = 'approved');
create policy "stories_admin_all"   on stories for all
  using (public.is_admin()) with check (public.is_admin());

-- events (canonical): anyone submits; public sees published; admins moderate
drop policy if exists "events_insert_any"     on events;
drop policy if exists "events_read_published" on events;
drop policy if exists "events_admin_all"      on events;
create policy "events_insert_any"     on events for insert with check (true);
create policy "events_read_published" on events for select using (status = 'published');
create policy "events_admin_all"      on events for all
  using (public.is_admin()) with check (public.is_admin());

-- event_translations: anyone submits; public sees translations of published events
drop policy if exists "event_tr_insert_any"  on event_translations;
drop policy if exists "event_tr_read_public" on event_translations;
drop policy if exists "event_tr_admin_all"   on event_translations;
create policy "event_tr_insert_any"  on event_translations for insert with check (true);
create policy "event_tr_read_public" on event_translations for select
  using (exists (select 1 from events e where e.id = event_id and e.status = 'published'));
create policy "event_tr_admin_all"   on event_translations for all
  using (public.is_admin()) with check (public.is_admin());

-- roadmap_feedback: anonymous write; admins read
drop policy if exists "feedback_insert_any"  on roadmap_feedback;
drop policy if exists "feedback_admin_read"  on roadmap_feedback;
create policy "feedback_insert_any" on roadmap_feedback for insert with check (true);
create policy "feedback_admin_read" on roadmap_feedback for select using (public.is_admin());

-- checkins: own rows only
drop policy if exists "checkins_select_own" on checkins;
drop policy if exists "checkins_insert_own" on checkins;
create policy "checkins_select_own" on checkins for select using (user_id = auth.uid());
create policy "checkins_insert_own" on checkins for insert with check (user_id = auth.uid());

-- symptom_logs: own rows only
drop policy if exists "symptoms_select_own" on symptom_logs;
drop policy if exists "symptoms_insert_own" on symptom_logs;
drop policy if exists "symptoms_update_own" on symptom_logs;
create policy "symptoms_select_own" on symptom_logs for select using (user_id = auth.uid());
create policy "symptoms_insert_own" on symptom_logs for insert with check (user_id = auth.uid());
create policy "symptoms_update_own" on symptom_logs for update using (user_id = auth.uid());

-- clinical_screenings: a clinician manages her own; admins read all
drop policy if exists "screenings_select"      on clinical_screenings;
drop policy if exists "screenings_insert_own"  on clinical_screenings;
drop policy if exists "screenings_update_own"  on clinical_screenings;
drop policy if exists "screenings_delete_own"  on clinical_screenings;
create policy "screenings_select" on clinical_screenings for select
  using (clinician_id = auth.uid() or public.is_admin());
create policy "screenings_insert_own" on clinical_screenings for insert
  with check (clinician_id = auth.uid() and public.is_clinician());
create policy "screenings_update_own" on clinical_screenings for update
  using (clinician_id = auth.uid());
create policy "screenings_delete_own" on clinical_screenings for delete
  using (clinician_id = auth.uid() or public.is_admin());

-- popia_deletion_log: admins only
drop policy if exists "popia_admin_all" on popia_deletion_log;
create policy "popia_admin_all" on popia_deletion_log for all
  using (public.is_admin()) with check (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- 8. Storage bucket for doctor photos
-- ═════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('doctor-photos', 'doctor-photos', true)
on conflict (id) do nothing;

drop policy if exists "doctor_photos_admin_write" on storage.objects;
drop policy if exists "doctor_photos_public_read" on storage.objects;
create policy "doctor_photos_admin_write" on storage.objects
  for all using (bucket_id = 'doctor-photos' and public.is_admin())
  with check (bucket_id = 'doctor-photos' and public.is_admin());
create policy "doctor_photos_public_read" on storage.objects
  for select using (bucket_id = 'doctor-photos');

-- ═════════════════════════════════════════════════════════════
-- 9. engagement_events (Phase 8 — internal CRM)
--
-- Tracks UI interactions for the admin CRM dashboard's funnel/top-content/
-- top-events views. Anonymous + signed-in supported.
--
-- POPIA design:
--   • user_id is ON DELETE SET NULL — user deletion preserves aggregate
--     counts without preserving identity.
--   • meta jsonb is restricted at the application layer to a non-PII
--     whitelist (lang, score_band, persona, format, province, source) —
--     never emails / names / addresses.
--   • RLS gates SELECT to admins only; INSERT is open (anonymous tracking).
-- ═════════════════════════════════════════════════════════════

create table if not exists engagement_events (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  event_type  text not null check (event_type in (
    'doctor_view',  'doctor_book_click',
    'content_view', 'content_link_click',
    'event_view',   'event_rsvp_click',
    -- Funnel analytics (first-party; target_id = path or domain, never PII)
    'page_view', 'questionnaire_start', 'questionnaire_domain',
    'questionnaire_complete', 'keep_submit'
  )),
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,
  target_id   text,
  meta        jsonb default '{}'::jsonb
);

create index if not exists engagement_events_type_created_idx
  on engagement_events (event_type, created_at desc);
create index if not exists engagement_events_user_created_idx
  on engagement_events (user_id, created_at desc);
create index if not exists engagement_events_target_idx
  on engagement_events (target_id);

alter table engagement_events enable row level security;

drop policy if exists "engagement_insert_any" on engagement_events;
create policy "engagement_insert_any" on engagement_events
  for insert with check (true);

drop policy if exists "engagement_admin_read" on engagement_events;
create policy "engagement_admin_read" on engagement_events
  for select using (public.is_admin());

-- Daily funnel export (Supabase dashboard → CSV). security_invoker keeps the
-- admin-only RLS of the underlying table in force.
create or replace view analytics_daily
  with (security_invoker = true) as
  select
    created_at::date            as day,
    event_type,
    target_id,
    count(*)                    as events,
    count(distinct session_id)  as sessions
  from engagement_events
  group by 1, 2, 3;

-- ═════════════════════════════════════════════════════════════
-- 10. admin_audit_log + is_admin_aal2 (Phase 9 — admin auth hardening)
--
-- AAL2 = the JWT's `aal` claim is 'aal2', i.e. the admin completed an MFA
-- challenge in the current session. Used to gate the most sensitive admin
-- paths (role changes, user deletion, audit-log read).
--
-- Insert path is service-role only (no INSERT policy on admin_audit_log) —
-- server actions write via the service client after the app-layer guard.
-- ═════════════════════════════════════════════════════════════

create or replace function public.is_admin_aal2()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin','superadmin') from public.users where id = auth.uid())
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2',
    false
  );
$$;
grant execute on function public.is_admin_aal2() to anon, authenticated;

-- Strict superadmin + AAL2 gate. Used by RLS on the audit log (Phase 13):
-- only superadmins (who have ALSO stepped up via TOTP, when MFA is on at
-- the project level) can read the audit trail. Defence in depth alongside
-- the requireSuperadmin app-layer guard.
create or replace function public.is_superadmin_aal2()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'superadmin' from public.users where id = auth.uid())
    and coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2',
    false
  );
$$;
grant execute on function public.is_superadmin_aal2() to anon, authenticated;

create table if not exists admin_audit_log (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,
  target_id   text,
  meta        jsonb default '{}'::jsonb
);
create index if not exists admin_audit_log_created_idx
  on admin_audit_log (created_at desc);
create index if not exists admin_audit_log_actor_idx
  on admin_audit_log (actor_id);

alter table admin_audit_log enable row level security;

-- Phase 13: audit log is superadmin-only. Drop the older admin-tier policy
-- (idempotent re-run safe) and re-grant SELECT through is_superadmin_aal2.
drop policy if exists "audit_admin_read" on admin_audit_log;
drop policy if exists "audit_superadmin_read" on admin_audit_log;
create policy "audit_superadmin_read" on admin_audit_log
  for select using (public.is_superadmin_aal2());
-- No insert policy — only service-role writes (via server actions).

-- ═════════════════════════════════════════════════════════════
-- 11. exhibition_signups (Silwerskermfees festival email capture)
--
-- Anonymous insert from the /exhibition demo funnel; rows hold PII
-- (email) so reads are admin-only — deliberately NOT the world-readable
-- sessions_select_own pattern. No update/delete policies: anon can't
-- touch rows post-insert (service role handles cleanup).
-- POPIA: consent is captured on the row itself (checkbox at the email
-- step). Delete-by-email must be included in the POPIA deletion process
-- alongside popia_deletion_log.
-- ═════════════════════════════════════════════════════════════

create table if not exists exhibition_signups (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),
  email            text not null,
  whatsapp         text,
  age_band         text check (age_band in ('20-29','30-39','40-44','45-49','50-54','55-59','60plus','none')),
  language_code    text references languages(code),
  meno_score       int,
  score_band       text check (score_band in ('mild','moderate','significant')),
  answers          jsonb,
  consent          boolean not null default false,
  -- Separate, explicit, unticked-by-default marketing opt-in — never bundled
  -- with the POPIA consent to store the answers.
  marketing_opt_in boolean not null default false,
  -- 'exhibition' (festival demo, curated answers) | 'roadmap' (post-score
  -- "keep my blanket" on the main site, full answer set).
  source           text not null default 'exhibition'
);

alter table exhibition_signups enable row level security;

drop policy if exists "exhibition_signups_insert_any" on exhibition_signups;
drop policy if exists "exhibition_signups_admin_read" on exhibition_signups;
create policy "exhibition_signups_insert_any" on exhibition_signups
  for insert with check (true);
create policy "exhibition_signups_admin_read" on exhibition_signups
  for select using (public.is_admin());

-- ═════════════════════════════════════════════════════════════
-- End of schema.
-- Bootstrap an admin after the first sign-up:
--   update users set role = 'admin' where email = 'you@example.com';
-- service_role has full access; run seed scripts with the service_role key.
-- ═════════════════════════════════════════════════════════════
