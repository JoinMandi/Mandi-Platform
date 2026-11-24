# Phase 0 acceptance

Record the date, commit and result for each check. The charter's gate is
"internal only" until every line passes.

## Local

| # | Check | Command | Expected | Result |
|---|---|---|---|---|
| 1 | Lint, types, unit tests, build | `npm run lint && npx tsc --noEmit && npm test && npm run build` | all green | |
| 2 | Migrations forward, back, forward | `docker compose up -d db && npm run db:setup && npm run db:rollback -- --count 100 && npm run db:migrate` | clean both ways | |
| 3 | RLS tests | `npm run test:db` | all pass; unauthorised read returns 0 rows | |
| 4 | Terraform | `terraform fmt -check -recursive` and `terraform validate` in `infra/` | valid | |
| 5 | Image | `docker compose --profile app build` | builds | |

## AWS staging

| # | Check | How | Expected | Result |
|---|---|---|---|---|
| 6 | Health | `curl -fsS https://staging.joinmandi.co.za/api/health` | 200, `{"status":"ok"}` | |
| 7 | Unauthenticated identity | `curl -i https://staging.joinmandi.co.za/api/auth/me` | 401 | |
| 8 | Member role | sign in as member (TOTP) → `/api/auth/me` | 200, `role:"member"` | |
| 9 | Member admin gate | `/api/admin/access` as member | 403 | |
| 10 | Clinician admin gate | `/api/admin/access` as clinician | 403 | |
| 11 | Admin gate | `/api/admin/access` as admin (TOTP) | 200 | |
| 12 | Admin page | open `/admin` as admin | dashboard loads | |
| 13 | Member admin page | open `/admin` as member | redirected away | |
| 14 | Cross-member read | member A requests member B's run through the app/DB | 0 rows / 403 | |
| 15 | Encryption | `aws rds describe-db-instances --db-instance-identifier mandi-staging` | `StorageEncrypted=true`, `BackupRetentionPeriod=14`, `PubliclyAccessible=false` | |
| 16 | Secrets | `aws secretsmanager get-secret-value --secret-id mandi/staging/app` with the Terraform identity | readable by ops only; not by the app instance beyond that secret | |
| 17 | PITR | restore drill in the runbook | scratch DB restores and has rows | |
| 18 | Logs | CloudWatch `/mandi/staging/app` | request/app logs present | |
| 19 | Alarms | CloudWatch alarms + SNS subscription confirmed | present | |
| 20 | Budget | Billing → Budgets | `mandi-staging-monthly` with 25–100% alerts | |
| 21 | CI | GitHub Actions on a PR | quality, database, infrastructure, container all green | |
| 22 | Deploy | GitHub Actions on `main` | deploy green; health check passed | |
| 23 | Restart policy | `docker restart <app-container>` on the instance | app returns healthy | |

## Notes

- Staging starts empty; only seeded public content and test accounts exist.
- No Supabase or Netlify dependency remains in the running stack. The live
  Netlify site can stay up until the Phase 1 cutover; it is not part of staging.
- The live Supabase project is frozen, not deleted, until staging passes.
