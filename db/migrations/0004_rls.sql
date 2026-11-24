-- Up Migration
-- Row-level security for the app role. The request identity is set by
-- src/server/db/withUser.ts as transaction-local GUCs (app.user_id,
-- app.user_role). mandi_service bypasses RLS for privileged operations.

-- ── Grants ───────────────────────────────────────────────────
grant usage on schema web, care to mandi_app;
grant usage on schema web, care, research to mandi_service;

grant select, insert, update, delete on all tables in schema web, care to mandi_app;
grant usage, select on all sequences in schema web, care to mandi_app;

grant all on all tables in schema web, care, research to mandi_service;
grant all on all sequences in schema web, care, research to mandi_service;

-- ── Helpers ──────────────────────────────────────────────────
create function web.user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.user_id', true), '')::uuid;
$$;

create function web.user_role()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.user_role', true), '');
$$;

-- Security definer: these are evaluated inside policies on web.users itself,
-- so they must not recurse through RLS or be filtered by it.
create function web.is_admin()
returns boolean
language sql
stable
security definer
set search_path = web, pg_temp
as $$
  select coalesce(
    (select role in ('admin','superadmin') from web.users where id = web.user_id()),
    false
  );
$$;

create function web.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = web, pg_temp
as $$
  select coalesce(
    (select role = 'superadmin' from web.users where id = web.user_id()),
    false
  );
$$;

create function web.is_clinician()
returns boolean
language sql
stable
security definer
set search_path = web, pg_temp
as $$
  select coalesce(
    (select role = 'clinician' from web.users where id = web.user_id()),
    false
  );
$$;

create function web.is_staff()
returns boolean
language sql
stable
security definer
set search_path = web, pg_temp
as $$
  select coalesce(
    (select role in ('clinician','admin','superadmin') from web.users where id = web.user_id()),
    false
  );
$$;

create function web.owns_run(p_run uuid)
returns boolean
language sql
stable
security definer
set search_path = web, pg_temp
as $$
  select exists (
    select 1 from web.questionnaire_runs
    where id = p_run and user_id = web.user_id()
  );
$$;

grant execute on function web.is_admin()      to mandi_app, mandi_service;
grant execute on function web.is_superadmin() to mandi_app, mandi_service;
grant execute on function web.is_clinician()  to mandi_app, mandi_service;
grant execute on function web.is_staff()      to mandi_app, mandi_service;
grant execute on function web.owns_run(uuid)  to mandi_app, mandi_service;

-- updated_at stamp
create function web.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated               before update on web.users                for each row execute function web.set_updated_at();
create trigger trg_content_updated             before update on web.content              for each row execute function web.set_updated_at();
create trigger trg_content_translations_updated before update on web.content_translations for each row execute function web.set_updated_at();
create trigger trg_clinic_directory_updated     before update on web.clinic_directory     for each row execute function web.set_updated_at();
create trigger trg_doctor_profiles_updated      before update on web.doctor_profiles      for each row execute function web.set_updated_at();
create trigger trg_stories_updated              before update on web.stories              for each row execute function web.set_updated_at();
create trigger trg_events_updated               before update on web.events               for each row execute function web.set_updated_at();
create trigger trg_event_translations_updated   before update on web.event_translations   for each row execute function web.set_updated_at();
create trigger trg_clinical_screenings_updated  before update on care.clinical_screenings for each row execute function web.set_updated_at();

-- Privilege-escalation guard (ported from the Supabase schema).
create function web.protect_user_role()
returns trigger
language plpgsql
security definer
set search_path = web, pg_temp
as $$
begin
  if new.role is distinct from old.role and web.user_id() is not null then
    if not web.is_admin() then
      new.role := old.role;
      return new;
    end if;
    if new.role in ('admin','superadmin') and not web.is_superadmin() then
      new.role := old.role;
      return new;
    end if;
    if old.role = 'superadmin' and not web.is_superadmin() then
      new.role := old.role;
      return new;
    end if;
    if old.role = 'superadmin' and new.role <> 'superadmin'
       and (select count(*) from web.users where role = 'superadmin') <= 1 then
      new.role := old.role;
      return new;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_protect_user_role before update on web.users
  for each row execute function web.protect_user_role();

-- ── RLS ─────────────────────────────────────────────────────
alter table web.languages                enable row level security;
alter table care.sessions                enable row level security;
alter table web.users                    enable row level security;
alter table care.questionnaire_responses enable row level security;
alter table web.content                  enable row level security;
alter table web.content_translations     enable row level security;
alter table web.clinic_directory         enable row level security;
alter table web.doctor_profiles          enable row level security;
alter table web.stories                  enable row level security;
alter table web.events                   enable row level security;
alter table web.event_translations       enable row level security;
alter table web.roadmap_feedback         enable row level security;
alter table care.checkins                enable row level security;
alter table care.symptom_logs            enable row level security;
alter table care.clinical_screenings     enable row level security;
alter table care.popia_deletion_log      enable row level security;
alter table web.engagement_events        enable row level security;
alter table web.admin_audit_log          enable row level security;
alter table web.exhibition_signups       enable row level security;
alter table web.questionnaire_versions   enable row level security;
alter table web.questionnaire_runs       enable row level security;
alter table web.questionnaire_items      enable row level security;
alter table care.consent_records         enable row level security;
alter table care.audit_events            enable row level security;
alter table research.participants        enable row level security;

-- ── Public / editorial ──────────────────────────────────────
create policy languages_read_all  on web.languages for select using (true);
create policy languages_admin_all on web.languages for all
  using (web.is_admin()) with check (web.is_admin());

create policy sessions_insert_any on care.sessions for insert with check (true);
create policy sessions_select_any on care.sessions for select using (true);

create policy qr_insert_any on care.questionnaire_responses for insert
  with check (user_id = web.user_id() or user_id is null);
create policy qr_select_own on care.questionnaire_responses for select
  using (user_id = web.user_id());
create policy qr_admin_read on care.questionnaire_responses for select
  using (web.is_admin());

create policy content_read_published on web.content for select using (published = true);
create policy content_admin_all on web.content for all
  using (web.is_admin()) with check (web.is_admin());

create policy content_tr_read_public on web.content_translations for select
  using (
    review_status = 'approved'
    and exists (select 1 from web.content c where c.id = content_id and c.published)
  );
create policy content_tr_admin_all on web.content_translations for all
  using (web.is_admin()) with check (web.is_admin());

create policy clinic_read_published on web.clinic_directory for select using (published = true);
create policy clinic_admin_all on web.clinic_directory for all
  using (web.is_admin()) with check (web.is_admin());

create policy doctor_read_published on web.doctor_profiles for select using (published = true);
create policy doctor_admin_all on web.doctor_profiles for all
  using (web.is_admin()) with check (web.is_admin());

create policy stories_insert_any on web.stories for insert with check (true);
create policy stories_read_public on web.stories for select using (status = 'approved');
create policy stories_admin_all on web.stories for all
  using (web.is_admin()) with check (web.is_admin());

create policy events_insert_any on web.events for insert with check (true);
create policy events_read_published on web.events for select using (status = 'published');
create policy events_admin_all on web.events for all
  using (web.is_admin()) with check (web.is_admin());

create policy event_tr_insert_any on web.event_translations for insert with check (true);
create policy event_tr_read_public on web.event_translations for select
  using (exists (select 1 from web.events e where e.id = event_id and e.status = 'published'));
create policy event_tr_admin_all on web.event_translations for all
  using (web.is_admin()) with check (web.is_admin());

create policy feedback_insert_any on web.roadmap_feedback for insert with check (true);
create policy feedback_admin_read on web.roadmap_feedback for select using (web.is_admin());

create policy engagement_insert_any on web.engagement_events for insert with check (true);
create policy engagement_admin_read on web.engagement_events for select using (web.is_admin());

create policy exhibition_signups_insert_any on web.exhibition_signups for insert with check (true);
create policy exhibition_signups_admin_read on web.exhibition_signups for select using (web.is_admin());

-- ── Users ───────────────────────────────────────────────────
create policy users_select_own on web.users for select using (id = web.user_id());
-- Signup may only create a member row; staff rows are provisioned by the
-- service role (invite flow).
create policy users_insert_own on web.users for insert
  with check (id = web.user_id() and role = 'member');
create policy users_update_own on web.users for update
  using (id = web.user_id()) with check (id = web.user_id());
create policy users_admin_read on web.users for select using (web.is_admin());
create policy users_admin_update on web.users for update
  using (web.is_admin()) with check (web.is_admin());
create policy users_admin_delete on web.users for delete using (web.is_admin());

-- ── Health data ─────────────────────────────────────────────
create policy checkins_select_own on care.checkins for select
  using (user_id = web.user_id() or web.is_admin());
create policy checkins_insert_own on care.checkins for insert with check (user_id = web.user_id());

create policy symptoms_select_own on care.symptom_logs for select
  using (user_id = web.user_id() or web.is_admin());
create policy symptoms_insert_own on care.symptom_logs for insert with check (user_id = web.user_id());
create policy symptoms_update_own on care.symptom_logs for update using (user_id = web.user_id());

create policy screenings_select on care.clinical_screenings for select
  using (clinician_id = web.user_id() or web.is_admin());
create policy screenings_insert_own on care.clinical_screenings for insert
  with check (clinician_id = web.user_id() and web.is_clinician());
create policy screenings_update_own on care.clinical_screenings for update
  using (clinician_id = web.user_id());
create policy screenings_delete_own on care.clinical_screenings for delete
  using (clinician_id = web.user_id() or web.is_admin());

create policy popia_admin_all on care.popia_deletion_log for all
  using (web.is_admin()) with check (web.is_admin());

-- ── Audit ───────────────────────────────────────────────────
-- The old admin audit log: superadmin read only; writes go through service.
create policy audit_superadmin_read on web.admin_audit_log for select
  using (web.is_superadmin());

-- The append-only care ledger: superadmin read only; service writes.
create policy care_audit_superadmin_read on care.audit_events for select
  using (web.is_superadmin());

-- ── Schema v1 (runs, items, consent) ────────────────────────
create policy versions_read_published on web.questionnaire_versions for select
  using (published_at is not null or web.is_admin());
create policy versions_admin_all on web.questionnaire_versions for all
  using (web.is_admin()) with check (web.is_admin());

create policy runs_select_own on web.questionnaire_runs for select
  using (user_id = web.user_id() or web.is_admin());
create policy runs_insert_own on web.questionnaire_runs for insert
  with check (user_id = web.user_id() or user_id is null);
create policy runs_update_own on web.questionnaire_runs for update
  using (user_id = web.user_id() and status = 'in_progress');

create policy items_select_own on web.questionnaire_items for select
  using (web.owns_run(run_id) or web.is_admin());
create policy items_insert_own on web.questionnaire_items for insert
  with check (web.owns_run(run_id));
create policy items_update_own on web.questionnaire_items for update
  using (web.owns_run(run_id));
create policy items_delete_own on web.questionnaire_items for delete
  using (web.owns_run(run_id));

create policy consent_select_own on care.consent_records for select
  using (user_id = web.user_id() or web.is_admin());
create policy consent_insert_any on care.consent_records for insert
  with check (user_id = web.user_id() or user_id is null);

-- ── Service role ─────────────────────────────────────────────
-- RDS does not let the master user grant BYPASSRLS, so the service role gets
-- narrow policies instead. It is only reachable from server-side privileged
-- paths (user deletion, audit writes, invite seeding).
create policy service_users_all on web.users for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_admin_audit_all on web.admin_audit_log for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_signups_all on web.exhibition_signups for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_deletion_log_all on care.popia_deletion_log for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_care_audit_all on care.audit_events for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_consent_all on care.consent_records for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_qr_all on care.questionnaire_responses for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_checkins_all on care.checkins for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_symptoms_all on care.symptom_logs for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_screenings_all on care.clinical_screenings for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_runs_all on web.questionnaire_runs for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_items_all on web.questionnaire_items for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_stories_all on web.stories for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');
create policy service_engagement_all on web.engagement_events for all
  using (web.user_role() = 'service') with check (web.user_role() = 'service');

-- research.participants: no policy for the app role. No USAGE on the research
-- schema either; only the service role and future research role reach it.

-- Down Migration
drop policy if exists languages_read_all on web.languages;
drop policy if exists languages_admin_all on web.languages;
drop policy if exists sessions_insert_any on care.sessions;
drop policy if exists sessions_select_any on care.sessions;
drop policy if exists qr_insert_any on care.questionnaire_responses;
drop policy if exists qr_select_own on care.questionnaire_responses;
drop policy if exists qr_admin_read on care.questionnaire_responses;
drop policy if exists content_read_published on web.content;
drop policy if exists content_admin_all on web.content;
drop policy if exists content_tr_read_public on web.content_translations;
drop policy if exists content_tr_admin_all on web.content_translations;
drop policy if exists clinic_read_published on web.clinic_directory;
drop policy if exists clinic_admin_all on web.clinic_directory;
drop policy if exists doctor_read_published on web.doctor_profiles;
drop policy if exists doctor_admin_all on web.doctor_profiles;
drop policy if exists stories_insert_any on web.stories;
drop policy if exists stories_read_public on web.stories;
drop policy if exists stories_admin_all on web.stories;
drop policy if exists events_insert_any on web.events;
drop policy if exists events_read_published on web.events;
drop policy if exists events_admin_all on web.events;
drop policy if exists event_tr_insert_any on web.event_translations;
drop policy if exists event_tr_read_public on web.event_translations;
drop policy if exists event_tr_admin_all on web.event_translations;
drop policy if exists feedback_insert_any on web.roadmap_feedback;
drop policy if exists feedback_admin_read on web.roadmap_feedback;
drop policy if exists engagement_insert_any on web.engagement_events;
drop policy if exists engagement_admin_read on web.engagement_events;
drop policy if exists exhibition_signups_insert_any on web.exhibition_signups;
drop policy if exists exhibition_signups_admin_read on web.exhibition_signups;
drop policy if exists users_select_own on web.users;
drop policy if exists users_insert_own on web.users;
drop policy if exists users_update_own on web.users;
drop policy if exists users_admin_read on web.users;
drop policy if exists users_admin_update on web.users;
drop policy if exists users_admin_delete on web.users;
drop policy if exists checkins_select_own on care.checkins;
drop policy if exists checkins_insert_own on care.checkins;
drop policy if exists symptoms_select_own on care.symptom_logs;
drop policy if exists symptoms_insert_own on care.symptom_logs;
drop policy if exists symptoms_update_own on care.symptom_logs;
drop policy if exists screenings_select on care.clinical_screenings;
drop policy if exists screenings_insert_own on care.clinical_screenings;
drop policy if exists screenings_update_own on care.clinical_screenings;
drop policy if exists screenings_delete_own on care.clinical_screenings;
drop policy if exists popia_admin_all on care.popia_deletion_log;
drop policy if exists audit_superadmin_read on web.admin_audit_log;
drop policy if exists care_audit_superadmin_read on care.audit_events;
drop policy if exists versions_read_published on web.questionnaire_versions;
drop policy if exists versions_admin_all on web.questionnaire_versions;
drop policy if exists runs_select_own on web.questionnaire_runs;
drop policy if exists runs_insert_own on web.questionnaire_runs;
drop policy if exists runs_update_own on web.questionnaire_runs;
drop policy if exists items_select_own on web.questionnaire_items;
drop policy if exists items_insert_own on web.questionnaire_items;
drop policy if exists items_update_own on web.questionnaire_items;
drop policy if exists items_delete_own on web.questionnaire_items;
drop policy if exists consent_select_own on care.consent_records;
drop policy if exists consent_insert_any on care.consent_records;
drop policy if exists service_users_all on web.users;
drop policy if exists service_admin_audit_all on web.admin_audit_log;
drop policy if exists service_signups_all on web.exhibition_signups;
drop policy if exists service_deletion_log_all on care.popia_deletion_log;
drop policy if exists service_care_audit_all on care.audit_events;
drop policy if exists service_consent_all on care.consent_records;
drop policy if exists service_qr_all on care.questionnaire_responses;
drop policy if exists service_checkins_all on care.checkins;
drop policy if exists service_symptoms_all on care.symptom_logs;
drop policy if exists service_screenings_all on care.clinical_screenings;
drop policy if exists service_runs_all on web.questionnaire_runs;
drop policy if exists service_items_all on web.questionnaire_items;
drop policy if exists service_stories_all on web.stories;
drop policy if exists service_engagement_all on web.engagement_events;

drop trigger if exists trg_users_updated on web.users;
drop trigger if exists trg_content_updated on web.content;
drop trigger if exists trg_content_translations_updated on web.content_translations;
drop trigger if exists trg_clinic_directory_updated on web.clinic_directory;
drop trigger if exists trg_doctor_profiles_updated on web.doctor_profiles;
drop trigger if exists trg_stories_updated on web.stories;
drop trigger if exists trg_events_updated on web.events;
drop trigger if exists trg_event_translations_updated on web.event_translations;
drop trigger if exists trg_clinical_screenings_updated on care.clinical_screenings;
drop trigger if exists trg_protect_user_role on web.users;

drop function if exists web.protect_user_role() cascade;
drop function if exists web.set_updated_at() cascade;
drop function if exists web.owns_run(uuid) cascade;
drop function if exists web.is_staff() cascade;
drop function if exists web.is_clinician() cascade;
drop function if exists web.is_superadmin() cascade;
drop function if exists web.is_admin() cascade;
drop function if exists web.user_role() cascade;
drop function if exists web.user_id() cascade;

alter table web.languages                disable row level security;
alter table care.sessions                disable row level security;
alter table web.users                    disable row level security;
alter table care.questionnaire_responses disable row level security;
alter table web.content                  disable row level security;
alter table web.content_translations     disable row level security;
alter table web.clinic_directory         disable row level security;
alter table web.doctor_profiles          disable row level security;
alter table web.stories                  disable row level security;
alter table web.events                   disable row level security;
alter table web.event_translations       disable row level security;
alter table web.roadmap_feedback         disable row level security;
alter table care.checkins                disable row level security;
alter table care.symptom_logs            disable row level security;
alter table care.clinical_screenings     disable row level security;
alter table care.popia_deletion_log      disable row level security;
alter table web.engagement_events        disable row level security;
alter table web.admin_audit_log          disable row level security;
alter table web.exhibition_signups       disable row level security;
alter table web.questionnaire_versions   disable row level security;
alter table web.questionnaire_runs       disable row level security;
alter table web.questionnaire_items      disable row level security;
alter table care.consent_records         disable row level security;
alter table care.audit_events            disable row level security;
alter table research.participants        disable row level security;

revoke all on all tables in schema web, care from mandi_app;
revoke all on all sequences in schema web, care from mandi_app;
revoke usage on schema web, care from mandi_app;
revoke all on all tables in schema web, care, research from mandi_service;
revoke all on all sequences in schema web, care, research from mandi_service;
revoke usage on schema web, care, research from mandi_service;
