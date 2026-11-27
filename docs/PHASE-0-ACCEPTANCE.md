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
| 8 | Member role | sign in as member (TOTP) → `/api/auth/me` | 200, `role:"member"` | 2026-11-27: PASS, `busi+phase0-member`, `role:"member"` (session reports `mfa:false` on the enrolment flow) |
| 9 | Member admin gate | `/api/admin/access` as member | 403 | 2026-11-27: PASS, 403 |
| 10 | Clinician admin gate | `/api/admin/access` as clinician | 403 | 2026-11-27: PASS, 403 |
| 11 | Admin gate | `/api/admin/access` as admin (TOTP) | 200 | 2026-11-27: PASS, `{"ok":true,"role":"admin"}`, session `mfa:true` after the pool-policy fix (PR #16) |
| 12 | Admin page | open `/admin` as admin | dashboard loads | 2026-11-27: PASS, CRM dashboard with 3 signed up |
| 13 | Member admin page | open `/admin` as member | redirected away | 2026-11-27: PASS, redirect to `/?denied=admin` |
| 14 | Cross-member read | member A requests member B's run through the app/DB | 0 rows / 403 | 2026-11-27: PASS at the database level on staging. Two runs inserted, one for the member and one for the clinician. As the member identity, the member saw 1 own run and 0 of the clinician's. |
| 15 | Encryption | `aws rds describe-db-instances --db-instance-identifier mandi-staging` | `StorageEncrypted=true`, `BackupRetentionPeriod=14`, `PubliclyAccessible=false` | 2026-11-26: pass (also CA `rds-ca-rsa2048-g1`, AZ `af-south-1a`) |
| 16 | Secrets | `aws secretsmanager get-secret-value --secret-id mandi/staging/app` with the Terraform identity | readable by ops only; not by the app instance beyond that secret | 2026-11-26: pass, instance role has `ReadAppSecret` scoped to this ARN only |
| 17 | PITR | restore drill in the runbook | scratch DB restores and has rows | 2026-11-27: PASS on re-run. `mandi-staging-restore-2` restored in about 14 minutes with 27 tables, 4 migrations, and seeded rows identical to the source: 4 events, 4 translations, 3 clinics, 2 doctors, 1 questionnaire version. The earlier empty restore is explained by a restore point that predated the first migrations. Both scratch instances deleted. |
| 18 | Logs | CloudWatch `/mandi/staging/app` | request/app logs present | 2026-11-27: PASS. After PR #13 deployed, `docker logs` shows `GET /api/health`, `/api/auth/me`, `/api/admin/access`, and the group has 7,776 stored bytes with 14-day retention. |
| 19 | Alarms | CloudWatch alarms + SNS subscription confirmed | present | 2026-11-27: three alarms present (`db-cpu`, `db-storage`, `instance-status`), all targeting `mandi-staging-alerts`. Subscription state needs the SNS console or the confirmation email; the Terraform identity cannot list it. |
| 20 | Budget | Billing → Budgets | `mandi-staging-monthly` with 25–100% alerts | 2026-11-26: pass |
| 21 | CI | GitHub Actions on a PR | quality, database, infrastructure, container all green | 2026-11-26, PR #12: pass (7 checks) |
| 22 | Deploy | GitHub Actions on `main` | deploy green; health check passed | 2026-11-26, run 45889007281: pass, 4m29s |
| 23 | Restart policy | `docker restart <app-container>` on the instance | app returns healthy | 2026-11-26: pass, health 200 after restart |

## Notes

- Staging starts empty; only seeded public content and test accounts exist.
- Auth acceptance found two defects, both fixed. Cognito omits `amr` from this
  pool's ID tokens and `AdminGetUser` reports no hosted-UI TOTP enrolment, so
  the AAL2 check now reads the pool policy with `DescribeUserPool` and fails
  closed (PR #16). The callback also redirected to the internal `0.0.0.0:3000`
  host after sign-in; it now uses `APP_URL` (PR #14).
- Test accounts: `busi+phase0-member@joinmandi.com`,
  `busi+phase0-clinician@joinmandi.com`, `busi+phase0-admin@joinmandi.com`.
  Synthetic staging only.
- No Supabase or Netlify dependency remains in the running stack. The live
  Netlify site can stay up until the Phase 1 cutover; it is not part of staging.
- The live Supabase project is frozen, not deleted, until staging passes.
