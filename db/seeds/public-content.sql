-- ════════════════════════════════════════════════════════════════════
-- JoinMandi — Phase 0 seed: public events, clinics, doctors
--
-- One-time seed migrating what used to be hardcoded in
--   src/app/events/page.tsx     (4 events + translations)
--   src/app/find-a-doctor/page.tsx (3 clinics, 2 doctors)
-- into actual published DB rows so the new DB-backed public pages
-- aren't empty on first deploy.
--
-- IDEMPOTENT: hard-coded UUIDs per row + `on conflict (id) do nothing`
-- on every insert. Safe to re-run. Re-running will NOT update rows that
-- already exist — if you want to edit a seeded row, edit it via
-- /admin/events, /admin/clinics, or /admin/doctors.
--
-- How to apply: paste the entire file into Supabase SQL editor and run.
-- ════════════════════════════════════════════════════════════════════

-- ── Events ─────────────────────────────────────────────────────────────

insert into web.events
  (id, date, location, online_url, host, free, cost, format, type, province, registration_url, status)
values
  -- Cape Town film screening (Aug 22 2026, 18:00)
  ('a1111111-1111-4111-8111-000000000001',
   '2026-08-22 18:00:00+02', 'Labia Theatre, Cape Town', null,
   'MrsKing Productions', true, null, 'inperson', 'Screening',
   'Western Cape', null, 'published'),
  -- Online Q&A with Dr Funeka Bango (Sep 14 2026, 19:30)
  ('a1111111-1111-4111-8111-000000000002',
   '2026-09-14 19:30:00+02', null, 'https://us02web.zoom.us/j/example',
   'Dr Funeka Bango', true, null, 'online', 'Q&A',
   null, null, 'published'),
  -- Mandi Café Woodstock (Oct 5 2026, 10:00)
  ('a1111111-1111-4111-8111-000000000003',
   '2026-10-05 10:00:00+02', 'Woodstock Exchange, Cape Town', null,
   'Mandi Community', true, null, 'inperson', 'Café',
   'Western Cape', null, 'published'),
  -- isiZulu community health talk Durban (Oct 19 2026, 14:00)
  ('a1111111-1111-4111-8111-000000000004',
   '2026-10-19 14:00:00+02', 'Durban Community Hall', null,
   'Community partner', true, null, 'inperson', 'Talk',
   'KwaZulu-Natal', null, 'published')
on conflict (id) do nothing;

-- English translations for the events.
insert into web.event_translations
  (id, event_id, language_code, name, description)
values
  ('b1111111-1111-4111-8111-000000000001',
   'a1111111-1111-4111-8111-000000000001', 'en',
   'Meer as Warm Gloede — Community Screening',
   'The kykNET documentary on the big screen. Community screenings followed by a facilitated conversation — in a venue near you.'),
  ('b1111111-1111-4111-8111-000000000002',
   'a1111111-1111-4111-8111-000000000002', 'en',
   'Ask a Menopause Specialist — Live Online',
   'A live Q&A with an integrative doctor. Bring your questions about HRT, body-identical hormones, and practical next steps.'),
  ('b1111111-1111-4111-8111-000000000003',
   'a1111111-1111-4111-8111-000000000003', 'en',
   'Mandi Café — Menopause Over Coffee',
   'No agenda, no pressure. Just women talking honestly about their bodies over coffee. Drop in any time.'),
  ('b1111111-1111-4111-8111-000000000004',
   'a1111111-1111-4111-8111-000000000004', 'en',
   'Hormonal Health in isiZulu',
   'A community health talk for women in KZN, in isiZulu, covering the basics of perimenopause and menopause.')
on conflict (id) do nothing;

-- ── Clinics ────────────────────────────────────────────────────────────

insert into web.clinic_directory
  (id, name, practice, province, languages, format, contact, booking_url, hrt_friendly, published)
values
  ('c2222222-2222-4222-8222-000000000001',
   'Newson Health SA Partner', 'Private GP', 'Western Cape',
   ARRAY['English','Afrikaans'], 'both',
   'hello@example-newson.co.za', null, true, true),
  ('c2222222-2222-4222-8222-000000000002',
   'Hormonal Health Centre', 'Gynaecology Practice', 'Gauteng',
   ARRAY['English'], 'both',
   'reception@example-hormonal.co.za', null, true, true),
  ('c2222222-2222-4222-8222-000000000003',
   'Community Women''s Clinic', 'Public Health', 'KwaZulu-Natal',
   ARRAY['English','isiZulu'], 'inperson',
   'info@example-community-clinic.org.za', null, false, true)
on conflict (id) do nothing;

-- ── Doctors ────────────────────────────────────────────────────────────

insert into web.doctor_profiles
  (id, name, practice, photo_url, bio, languages, booking_url, published)
values
  ('d3333333-3333-4333-8333-000000000001',
   'Dr Funeka Bango', 'Integrative Medicine', null,
   'Clinical advisor to JoinMandi. A warm, evidence-forward practitioner with a focus on hormonal health for African women.',
   ARRAY['English','isiXhosa'], null, true),
  ('d3333333-3333-4333-8333-000000000002',
   'Dr Sarah van Dyk', 'Gynaecology & Menopause', null,
   'HRT-trained GP practising in Stellenbosch. Body-identical HRT specialist with telehealth across South Africa.',
   ARRAY['English','Afrikaans'], null, true)
on conflict (id) do nothing;

-- ── Done ───────────────────────────────────────────────────────────────
-- After running this, verify:
--   select count(*) from events where status='published';        -- expect 4
--   select count(*) from event_translations;                     -- expect 4
--   select count(*) from clinic_directory where published=true;  -- expect 3
--   select count(*) from doctor_profiles where published=true;   -- expect 2
