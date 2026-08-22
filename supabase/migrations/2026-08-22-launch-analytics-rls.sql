-- Pre-launch migration (apply once in the Supabase SQL editor).
-- Mirrors the edits in schema.sql; safe to re-run.

-- 1. Funnel analytics event types
alter table engagement_events drop constraint if exists engagement_events_event_type_check;
alter table engagement_events add constraint engagement_events_event_type_check
  check (event_type in (
    'doctor_view',  'doctor_book_click',
    'content_view', 'content_link_click',
    'event_view',   'event_rsvp_click',
    'page_view', 'questionnaire_start', 'questionnaire_domain',
    'questionnaire_complete', 'keep_submit'
  ));

-- 2. Daily export view (dashboard → CSV)
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

-- 3. Anonymous health rows must not be readable with the anon key
drop policy if exists "qr_select_own" on questionnaire_responses;
create policy "qr_select_own" on questionnaire_responses for select
  using (user_id = auth.uid());
