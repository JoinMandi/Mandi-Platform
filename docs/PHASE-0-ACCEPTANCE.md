# Phase 0 acceptance

Record the date, commit and result for each check. The charter's gate is
"internal only" until every line passes.

## Local

| # | Check | Command | Expected | Result |
|---|---|---|---|---|
| 1 | Lint, types, unit tests, build | `npm run lint && npx tsc --noEmit && npm test && npm run build` | all green | 2026-11-26 `fix/phase-0-deploy`: pass (50 unit tests, build 41 routes) |
| 2 | Migrations forward, back, forward | `docker compose up -d db && npm run db:setup && npm run db:rollback -- --count 100 && npm run db:migrate` | clean both ways | 2026-11-26: pass against local Postgres 16 (down 100 -> up -> seed; 4 migrations, 27 tables). Staging: 0004 down then up, health 200 both times. |
| 3 | RLS tests | `npm run test:db` | all pass; unauthorised read returns 0 rows | 2026-11-26: pass, 10 tests |
| 4 | Terraform | `terraform fmt -check -recursive` and `terraform validate` in `infra/` | valid | 2026-11-26: pass |
| 5 | Image | `docker compose --profile app build` | builds | 2026-11-26: pass (migrator target built locally; CI container job green on PR #12) |

## AWS staging

| # | Check | How | Expected | Result |
|---|---|---|---|---|
| 6 | Health | `curl -fsS https://staging.joinmandi.co.za/api/health` | 200, `{"status":"ok"}` | 2026-11-26, deploy 45889007281: pass |
| 7 | Unauthenticated identity | `curl -i https://staging.joinmandi.co.za/api/auth/me` | 401 | 2026-11-26: pass |
| 8 | Member role | sign in as member (TOTP) → `/api/auth/me` | 200, `role:"member"` | pending: needs staging test accounts |
| 9 | Member admin gate | `/api/admin/access` as member | 403 | pending |
| 10 | Clinician admin gate | `/api/admin/access` as clinician | 403 | pending |
| 11 | Admin gate | `/api/admin/access` as admin (TOTP) | 200 | pending |
| 12 | Admin page | open `/admin` as admin | dashboard loads | pending |
| 13 | Member admin page | open `/admin` as member | redirected away | unauth: 307 to `/auth/login`; member case pending |
| 14 | Cross-member read | member A requests member B's run through the app/DB | 0 rows / 403 | pending |
| 15 | Encryption | `aws rds describe-db-instances --db-instance-identifier mandi-staging` | `StorageEncrypted=true`, `BackupRetentionPeriod=14`, `PubliclyAccessible=false` | 2026-11-26: pass (also CA `rds-ca-rsa2048-g1`, AZ `af-south-1a`) |
| 16 | Secrets | `aws secretsmanager get-secret-value --secret-id mandi/staging/app` with the Terraform identity | readable by ops only; not by the app instance beyond that secret | 2026-11-26: pass, instance role has `ReadAppSecret` scoped to this ARN only |
| 17 | PITR | restore drill in the runbook | scratch DB restores and has rows | 2026-11-27: PASS on re-run. `mandi-staging-restore-2` restored in about 14 minutes with 27 tables, 4 migrations, and seeded rows identical to the source: 4 events, 4 translations, 3 clinics, 2 doctors, 1 questionnaire version. The earlier empty restore is explained by a restore point that predated the first migrations. Both scratch instances deleted. |
| 18 | Logs | CloudWatch `/mandi/staging/app` | request/app logs present | gap: group exists with 14-day retention but no entries; the app writes nothing and Caddy logs are not shipped. Fix in PR #13 logs API requests from middleware; re-check after it deploys. |
| 19 | Alarms | CloudWatch alarms + SNS subscription confirmed | present | alarms present and target `mandi-staging-alerts`; subscription confirmation needs the console |
| 20 | Budget | Billing → Budgets | `mandi-staging-monthly` with 25–100% alerts | 2026-11-26: pass |
| 21 | CI | GitHub Actions on a PR | quality, database, infrastructure, container all green | 2026-11-26, PR #12: pass (7 checks) |
| 22 | Deploy | GitHub Actions on `main` | deploy green; health check passed | 2026-11-26, run 45889007281: pass, 4m29s |
| 23 | Restart policy | `docker restart <app-container>` on the instance | app returns healthy | 2026-11-26: pass, health 200 after restart |

## Notes

- Staging starts empty; only seeded public content and test accounts exist.
- No Supabase or Netlify dependency remains in the running stack. The live
  Netlify site can stay up until the Phase 1 cutover; it is not part of staging.
- The live Supabase project is frozen, not deleted, until staging passes.
