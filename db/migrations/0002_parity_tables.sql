-- Up Migration
-- Parity port of the existing product tables, regrouped into web (app and
-- editorial) and care (health and consent).

create table web.languages (
  code         text primary key,
  name         text not null,
  native_name  text not null,
  enabled      boolean default true,
  sort_order   integer default 0
);

insert into web.languages (code, name, native_name, sort_order) values
  ('en','English','English',1),
  ('zu','isiZulu','isiZulu',2),
  ('xh','isiXhosa','isiXhosa',3),
  ('af','Afrikaans','Afrikaans',4);

-- Anonymous + signed-in session identity and POPIA consent.
create table care.sessions (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz default now(),
  language_code      text references web.languages(code),
  popia_consent      boolean default false,
  popia_consent_at   timestamptz
);

-- Profile mirror of the Cognito user. Role is the app's source of truth.
create table web.users (
  id             uuid primary key,             -- Cognito sub
  email          text,
  language_code  text references web.languages(code),
  role           text not null default 'member'
                   check (role in ('member','clinician','admin','superadmin')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table care.questionnaire_responses (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid references care.sessions(id) on delete cascade,
  user_id          uuid references web.users(id) on delete cascade,
  language_code    text references web.languages(code),
  answers          jsonb,
  meno_score       integer check (meno_score between 0 and 100),
  score_band       text    check (score_band in ('mild','moderate','significant')),
  persona          text    check (persona in ('sally','olga','vicky','nelly','nina','retha','colleen')),
  self_harm_flag   boolean default false,
  colleen_flag     boolean default false,
  top_domains      text[],
  completed_at     timestamptz default now()
);

create table web.content (
  id            uuid primary key default gen_random_uuid(),
  type          text check (type in ('article','video','podcast')),
  symptom_tags  text[],
  persona_tags  text[],
  published     boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create table web.content_translations (
  id             uuid primary key default gen_random_uuid(),
  content_id     uuid not null references web.content(id) on delete cascade,
  language_code  text not null references web.languages(code),
  title          text not null,
  description    text,
  url            text,
  review_status  text not null default 'draft'
                   check (review_status in ('draft','in_review','approved')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (content_id, language_code)
);

create table web.clinic_directory (
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

create table web.doctor_profiles (
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

create table web.stories (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid references care.sessions(id) on delete set null,
  user_id        uuid references web.users(id) on delete set null,
  content        text not null,
  author_name    text,
  language_code  text references web.languages(code),
  symptom_tags   text[],
  consent        boolean default false,
  status         text default 'pending' check (status in ('pending','approved','rejected')),
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table web.events (
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

create table web.event_translations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references web.events(id) on delete cascade,
  language_code  text not null references web.languages(code),
  name           text not null,
  description    text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now(),
  unique (event_id, language_code)
);

create table web.roadmap_feedback (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid references care.sessions(id) on delete cascade,
  feels_right       text check (feels_right in ('yes','mostly','not-quite')),
  missing_content   text,
  created_at        timestamptz default now()
);

create table care.checkins (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references web.users(id) on delete cascade,
  type                  text check (type in ('6week','3month')),
  original_response_id  uuid references care.questionnaire_responses(id) on delete cascade,
  new_response_id       uuid references care.questionnaire_responses(id) on delete set null,
  action_taken          text,
  open_response         text,
  completed_at          timestamptz
);

create table care.symptom_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references web.users(id) on delete cascade,
  logged_date  date not null,
  domain       text,
  score        integer check (score between 0 and 3),
  created_at   timestamptz default now(),
  unique (user_id, logged_date, domain)
);

create table care.clinical_screenings (
  id                    uuid primary key default gen_random_uuid(),
  clinician_id          uuid references web.users(id) on delete cascade,
  patient_reference     text,
  language_code         text references web.languages(code),
  answers               jsonb,
  score                 integer,
  risk_band             text check (risk_band in ('low','moderate','high')),
  referral_recommended  boolean default false,
  clinician_notes       text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create table care.popia_deletion_log (
  id           uuid primary key default gen_random_uuid(),
  deleted_at   timestamptz default now(),
  user_email   text,
  deleted_by   uuid references web.users(id) on delete set null
);

create table web.engagement_events (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  event_type  text not null check (event_type in (
    'doctor_view',  'doctor_book_click',
    'content_view', 'content_link_click',
    'event_view',   'event_rsvp_click',
    'page_view', 'questionnaire_start', 'questionnaire_domain',
    'questionnaire_complete', 'keep_submit'
  )),
  user_id     uuid references web.users(id) on delete set null,
  session_id  text,
  target_id   text,
  meta        jsonb default '{}'::jsonb
);

create table web.exhibition_signups (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz default now(),
  email            text not null,
  whatsapp         text,
  age_band         text check (age_band in ('20-29','30-39','40-44','45-49','50-54','55-59','60plus','none')),
  language_code    text references web.languages(code),
  meno_score       int,
  score_band       text check (score_band in ('mild','moderate','significant')),
  answers          jsonb,
  consent          boolean not null default false,
  marketing_opt_in boolean not null default false,
  source           text not null default 'exhibition'
);

create table web.admin_audit_log (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  -- No FK: the actor id must survive account deletion.
  actor_id    uuid,
  actor_email text,
  action      text not null,
  target_id   text,
  meta        jsonb default '{}'::jsonb
);

create view web.analytics_daily
  with (security_invoker = true) as
  select
    created_at::date            as day,
    event_type,
    target_id,
    count(*)                    as events,
    count(distinct session_id)  as sessions
  from web.engagement_events
  group by 1, 2, 3;

create index idx_qr_session     on care.questionnaire_responses(session_id);
create index idx_qr_user        on care.questionnaire_responses(user_id);
create index idx_qr_persona     on care.questionnaire_responses(persona);
create index idx_stories_status on web.stories(status);
create index idx_stories_lang   on web.stories(language_code);
create index idx_events_status   on web.events(status);
create index idx_events_province on web.events(province);
create index idx_events_date     on web.events(date);
create index idx_checkins_user   on care.checkins(user_id);
create index idx_symptom_logs_user_date on care.symptom_logs(user_id, logged_date);
create index idx_content_published on web.content(published) where published;
create index idx_clinic_published  on web.clinic_directory(published) where published;
create index idx_doctor_published  on web.doctor_profiles(published) where published;
create index idx_content_tr_content on web.content_translations(content_id);
create index idx_content_tr_lang    on web.content_translations(language_code);
create index idx_event_tr_event     on web.event_translations(event_id);
create index idx_screenings_clinician on care.clinical_screenings(clinician_id);
create index engagement_events_type_created_idx on web.engagement_events (event_type, created_at desc);
create index engagement_events_user_created_idx on web.engagement_events (user_id, created_at desc);
create index engagement_events_target_idx on web.engagement_events (target_id);
create index admin_audit_log_created_idx on web.admin_audit_log (created_at desc);
create index admin_audit_log_actor_idx on web.admin_audit_log (actor_id);

-- Down Migration
drop view if exists web.analytics_daily;
drop table if exists web.admin_audit_log;
drop table if exists web.exhibition_signups;
drop table if exists web.engagement_events;
drop table if exists care.popia_deletion_log;
drop table if exists care.clinical_screenings;
drop table if exists care.symptom_logs;
drop table if exists care.checkins;
drop table if exists web.roadmap_feedback;
drop table if exists web.event_translations;
drop table if exists web.events;
drop table if exists web.stories;
drop table if exists web.doctor_profiles;
drop table if exists web.clinic_directory;
drop table if exists web.content_translations;
drop table if exists web.content;
drop table if exists care.questionnaire_responses;
drop table if exists web.users;
drop table if exists care.sessions;
drop table if exists web.languages;
