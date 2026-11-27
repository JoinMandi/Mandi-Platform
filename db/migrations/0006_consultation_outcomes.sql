-- Up Migration

alter table care.consultations add column attended       text;
alter table care.consultations add column read_summary   text;
alter table care.consultations add column changed        text[];
alter table care.consultations add column treatment      jsonb;
alter table care.consultations add column referral       text;
alter table care.consultations add column follow_up_at   date;
alter table care.consultations add column fee_cents      integer;
alter table care.consultations add column usefulness     integer;
alter table care.consultations add column outcome_at     timestamptz;

-- Down Migration

alter table care.consultations drop column if exists outcome_at;
alter table care.consultations drop column if exists usefulness;
alter table care.consultations drop column if exists fee_cents;
alter table care.consultations drop column if exists follow_up_at;
alter table care.consultations drop column if exists referral;
alter table care.consultations drop column if exists treatment;
alter table care.consultations drop column if exists changed;
alter table care.consultations drop column if exists read_summary;
alter table care.consultations drop column if exists attended;
