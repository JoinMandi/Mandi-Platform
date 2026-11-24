# ADR 0001 — Phase 0 stack and hosting

Status: accepted, 24 November 2026.

## Context

The prototype ran on Netlify + Supabase. The pilot charter requires health data,
storage, backups and logs to sit in AWS `af-south-1` (Cape Town) before any real
data, with staff MFA, explicit roles, versioned migrations, tested authorisation,
secrets and backups. Phase 0 is the gate; Phase 1 moves the intake slice.

## Decision

| Concern | Choice | Why |
|---|---|---|
| Region | AWS `af-south-1` | Keeps core health data in South Africa. |
| Compute | One `t4g.small` EC2 instance, Docker Compose, `restart: unless-stopped` | A pilot of 100–150 users does not need an orchestrator. Cheap, one box to operate. |
| Container | Multi-stage Dockerfile, Next.js standalone output | Same image locally, in CI and on the server. |
| Ingress / TLS | Caddy on the instance, Let's Encrypt, a `staging.` subdomain of the GoDaddy domain | The team owns the domains, so no CloudFront or ACM is needed. Caddy renews certificates automatically. |
| Database | RDS Postgres 16, `db.t4g.micro`, 20 GB gp3, private | Managed backups, PITR, encryption and patching. |
| Identity | Cognito user pool in `af-south-1`, TOTP MFA, groups `member`/`clinician`/`admin`/`superadmin` | In-region, managed, supports MFA and role separation. Replaces Supabase Auth. |
| Media | Private S3 bucket, served through the app | No public bucket; originals stay in-region. |
| Secrets | One Secrets Manager JSON bundle read by the instance role | No secrets in git or `.env` on disk beyond a root-only file. |
| IaC | Terraform, S3 + DynamoDB remote state | Reviewable, repeatable, staging/prod parity. |
| CI/CD | GitHub Actions + OIDC, ECR, SSM `SendCommand` | No long-lived AWS keys; deploys by image SHA. |
| Data access | Native `pg` in `src/server/data/**`, RLS still enforced | Removes Supabase entirely; RLS remains defence in depth. |
| Migrations | `node-pg-migrate`, SQL files in `db/migrations/` | Forward and back, one owner connection. |

## Identity details

- User pool enforces TOTP MFA. The ID token's `amr` claim must contain a
  software-token method for staff routes; `cognito:groups` is mapped to the app
  role, but `web.users.role` is the source of truth for guards.
- Sessions are sealed HttpOnly cookies (`iron-session`) holding the verified ID
  token claims for one hour. There is no refresh-token flow in Phase 0;
  users re-authenticate when the session expires.
- Staff accounts are created by a superadmin (`AdminCreateUser` + group), never
  self-service. Members can self-register in the pool.
- Superadmin is a strict superset of admin in the app layer and in RLS.

## Backup and recovery

- RDS automated backups retain 14 days and point-in-time recovery is enabled, so
  the database can be restored to any second in that window.
- Deletion protection is on. The acceptance run includes a restore into a scratch
  instance and a row count check.
- S3 uses versioning and server-side encryption. Secrets Manager keeps versions.

## Residency note

TLS terminates on the Cape Town instance. DNS stays at GoDaddy; one A record
points the staging subdomain at the Elastic IP. No health data is stored or
processed outside `af-south-1`.

## Upgrade path

Move to an ALB + a second instance behind it (or ECS Fargate) when uptime
requirements or traffic exceed one box. Add a production AWS account, a custom
domain, WAF and cross-region backup copies at that point. Nothing in Phase 0
depends on the single-instance shape.

## Dependency baseline (Phase 0)

- Next 14.2.35 is the latest 14.2.x. `npm audit` still reports a critical Next
  advisory for the Image Optimizer; `images.unoptimized = true` and no
  `remotePatterns` mean that endpoint is not reachable. The remaining
  high/critical advisories (Next/PostCSS/i18next) need a Next 16 + React 19
  major upgrade. **Do that before production**; it is intentionally not mixed
  into the Phase 0 cutover.
- `glob`/`minimatch`/`node-pg-migrate` are migration tooling, present only in
  the migrator image, not the app runtime.
- No application secrets are committed; the AWS keys for the bootstrap
  identity live only in the operator's AWS profile.

## Deferred

Amazon SES, WhatsApp reminders, Paystack, booking/Calendly/Teams, check-ins,
clinician portal, research export, and the Phase 1 switch from parity tables to
`questionnaire_runs`/`items` and the versioned consent ledger.
