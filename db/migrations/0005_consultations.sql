-- Up Migration

-- v4 check-ins are six-week and four-month; add 4month to the allowed types.
alter table care.checkins drop constraint if exists checkins_type_check;
alter table care.checkins add constraint checkins_type_check
  check (type in ('6week','3month','4month'));

create table care.consultations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references web.users(id) on delete cascade,
  doctor_name        text,
  appointment_at     timestamptz,
  status             text not null default 'booked'
                       check (status in ('booked','attended','completed','followed_up','no_show','rescheduled','cancelled')),
  recording_required boolean not null default true,
  recording_consent  boolean not null default false,
  intake             jsonb,
  created_at         timestamptz not null default now()
);

create index idx_consultations_user on care.consultations(user_id);

alter table care.consultations enable row level security;

create policy consult_select_own on care.consultations for select
  using (user_id = web.user_id() or web.is_admin());
create policy consult_insert_own on care.consultations for insert
  with check (user_id = web.user_id());
create policy consult_update_own on care.consultations for update
  using (user_id = web.user_id());

grant select, insert, update, delete on care.consultations to mandi_app;
grant all on care.consultations to mandi_service;

-- Down Migration

drop policy if exists consult_update_own on care.consultations;
drop policy if exists consult_insert_own on care.consultations;
drop policy if exists consult_select_own on care.consultations;
revoke all on care.consultations from mandi_app;
revoke all on care.consultations from mandi_service;
drop table if exists care.consultations;

alter table care.checkins drop constraint if exists checkins_type_check;
alter table care.checkins add constraint checkins_type_check
  check (type in ('6week','3month'));
