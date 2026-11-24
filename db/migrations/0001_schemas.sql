-- Up Migration
-- Phase 0: one database, three schemas. gen_random_uuid() is core in PG 13+.
create schema if not exists web;
create schema if not exists care;
create schema if not exists research;

-- Down Migration
drop schema if exists research cascade;
drop schema if exists care cascade;
drop schema if exists web cascade;
