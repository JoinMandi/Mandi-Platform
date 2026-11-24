-- Up Migration
-- Charter schema v1: versioned questionnaire runs/items, the consent ledger,
-- append-only audit events, and pseudonymous research participants.
-- Phase 1 adopts these for intake; Phase 0 creates and policy-tests them.

create table web.questionnaire_versions (
  id            uuid primary key default gen_random_uuid(),
  version       text not null unique,
  definition    jsonb not null,
  published_at  timestamptz,
  created_at    timestamptz not null default now()
);

create table web.questionnaire_runs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references web.users(id) on delete cascade,
  version_id       uuid not null references web.questionnaire_versions(id),
  status           text not null default 'in_progress'
                     check (status in ('in_progress','submitted','abandoned')),
  idempotency_key  text unique,
  started_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  created_at       timestamptz not null default now()
);

create table web.questionnaire_items (
  id            bigserial primary key,
  run_id        uuid not null references web.questionnaire_runs(id) on delete cascade,
  question_key  text not null,
  answer        jsonb not null,
  answered_at   timestamptz not null default now(),
  unique (run_id, question_key)
);

create table care.consent_records (
  id               uuid primary key default gen_random_uuid(),
  -- Deliberately no FK: consent is a legal record that must survive user
  -- erasure and run cleanup (POPIA keeps a cut-down proof).
  user_id          uuid,
  run_id           uuid,
  consent_code     text not null check (consent_code in ('C1','C2','C3','C4','C5','C6')),
  action           text not null default 'granted' check (action in ('granted','withdrawn')),
  wording_version  text not null,
  wording_hash     text not null,
  ip_hash          text,
  ua_hash          text,
  recorded_at      timestamptz not null default now()
);

create table care.audit_events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  -- No FK: the audit actor id must remain readable after the account is gone.
  actor_id     uuid,
  actor_email  text,
  action       text not null,
  entity       text,
  entity_id    text,
  before       jsonb,
  after        jsonb,
  meta         jsonb not null default '{}'::jsonb
);

create table research.participants (
  id           uuid primary key default gen_random_uuid(),
  research_id  text not null unique,
  cohort       text,
  enrolled_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index questionnaire_runs_user_idx on web.questionnaire_runs (user_id, started_at desc);
create index questionnaire_runs_status_idx on web.questionnaire_runs (status);
create index questionnaire_items_run_idx on web.questionnaire_items (run_id);
create index consent_records_user_idx on care.consent_records (user_id, recorded_at desc);
create index consent_records_run_idx on care.consent_records (run_id);
create index audit_events_created_idx on care.audit_events (created_at desc);
create index audit_events_actor_idx on care.audit_events (actor_id);

-- Append-only audit ledger.
create function care.prevent_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only table: %', tg_table_name;
end;
$$;

create trigger audit_events_append_only
  before update or delete on care.audit_events
  for each row execute function care.prevent_mutation();

create trigger consent_records_append_only
  before update or delete on care.consent_records
  for each row execute function care.prevent_mutation();

-- A submitted run (and its items) cannot be edited. Deletion is allowed for
-- POPIA erasure cascades and is not reachable through app-role RLS policies.
create function web.protect_submitted_run()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'submitted' then
    raise exception 'questionnaire run % is submitted and immutable', old.id;
  end if;
  return new;
end;
$$;

create trigger questionnaire_runs_submitted_immutable
  before update on web.questionnaire_runs
  for each row execute function web.protect_submitted_run();

create function web.protect_submitted_item()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from web.questionnaire_runs
    where id = old.run_id and status = 'submitted'
  ) then
    raise exception 'questionnaire run % is submitted and immutable', old.run_id;
  end if;
  return new;
end;
$$;

create trigger questionnaire_items_submitted_immutable
  before update on web.questionnaire_items
  for each row execute function web.protect_submitted_item();

-- Down Migration
drop table if exists research.participants;
drop table if exists care.audit_events;
drop table if exists care.consent_records;
drop table if exists web.questionnaire_items;
drop table if exists web.questionnaire_runs;
drop table if exists web.questionnaire_versions;
drop function if exists web.protect_submitted_item();
drop function if exists web.protect_submitted_run();
drop function if exists care.prevent_mutation();
