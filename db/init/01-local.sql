-- Local development database setup.
-- Passwords are dev-only; staging/production use Secrets Manager.
create database mandi_test;

do $$
begin
  if not exists (select from pg_roles where rolname = 'mandi_app') then
    create role mandi_app login password 'localdev';
  end if;
  if not exists (select from pg_roles where rolname = 'mandi_service') then
    create role mandi_service login password 'localdev';
  end if;
end
$$;
