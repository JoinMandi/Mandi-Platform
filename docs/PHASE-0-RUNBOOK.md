# Phase 0 runbook — staging on AWS af-south-1

Everything here is for the internal staging environment. No real health data.

## 0. Prerequisites

- AWS account `179066830383` (JoinMandi).
- Terraform 1.9+ (`winget install Hashicorp.Terraform`).
- Docker Desktop (for local Postgres and image builds).
- AWS CLI v2.
- GoDaddy access for `joinmandi.co.za`.

### Docker Desktop stuck on a stale socket

If Docker Desktop fails with `initializing Inference manager … dockerInference`,
close Docker Desktop and rename the run directory:

```powershell
Rename-Item "$env:LOCALAPPDATA\Docker\run" "run.stale-$(Get-Date -Format yyyyMMddHHmmss)"
```

Start Docker Desktop again.

## 1. Create the Terraform IAM identity (once, not root)

1. IAM → Users → Create user → `mandi-terraform` → no console access.
2. IAM → Policies → Create policy → JSON → paste
   `infra/iam/terraform-bootstrap-policy.json` → name `MandiTerraformBootstrap`.
3. Attach the policy to `mandi-terraform`.
4. User → Security credentials → Create access key → CLI.
5. Locally:

```powershell
aws configure --profile mandi
```

Region `af-south-1`, output `json`.

Verify:

```powershell
aws sts get-caller-identity --profile mandi
```

## 2. Bootstrap Terraform state (once)

```powershell
cd infra/bootstrap
terraform init
terraform apply
```

Copy the outputs into `infra/backend.hcl` (from `backend.hcl.example`).

## 3. Apply staging

```powershell
cd infra
Copy-Item backend.hcl.example backend.hcl
Copy-Item envs/staging.tfvars.example envs/staging.tfvars
terraform init -backend-config=backend.hcl
terraform plan -var-file=envs/staging.tfvars
terraform apply -var-file=envs/staging.tfvars
```

Useful outputs:

```powershell
terraform output -raw dns_record
terraform output -raw deploy_role_arn
terraform output -raw ecr_repository_url
terraform output -raw instance_id
```

## 4. DNS

At GoDaddy → `joinmandi.co.za` → Manage DNS, add:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `staging` | the Elastic IP from `terraform output -raw elastic_ip` | 600 |

Caddy requests the Let's Encrypt certificate on first start. Keep DNS at
GoDaddy; no Route 53 zone is needed.

## 5. GitHub Actions

Repository → Settings → Secrets and variables → Actions:

- Secret `AWS_DEPLOY_ROLE_ARN` = `terraform output -raw deploy_role_arn`.
- Variable `APP_DOMAIN` = `staging.joinmandi.co.za`.
- Environment `staging` (optional required reviewers).

Push to `main` (or run the workflow manually). It builds the app and migrator
images, pushes them to ECR, runs provisioning + migrations + seed through SSM,
starts Compose/Caddy, and hits `/api/health`.

Images are tagged `<sha>-<run-id>-<attempt>`, so a re-run of the same commit
does not collide with the immutable ECR repository. The migrator image sets
`NODE_EXTRA_CA_CERTS=/app/certs/global-bundle.pem`; without it,
`node-pg-migrate` rejects the RDS certificate (provisioning loads the bundle
itself, so it succeeds first and hides the problem).

## 6. First staff accounts

Once a deploy has produced an image (the `IMAGE=` line exists in
`/opt/mandi/.env`), create the first superadmin from the instance:

```powershell
aws ssm send-command --profile mandi `
  --instance-ids <instance-id> `
  --document-name AWS-RunShellScript `
  --parameters "commands=/opt/mandi/seed-staff.sh busi@joinmandi.com superadmin"
```

Then create the admin and clinician accounts the same way, with `admin` and
`clinician`. Each person receives a Cognito invitation email and enrols TOTP on
first sign-in.

## 7. Seeding public content

The migrator container runs `db/seed.mjs` on every deploy; the public events,
clinics and doctors are idempotent seeds. No manual step.

## 8. Acceptance

Follow `docs/PHASE-0-ACCEPTANCE.md`.

## 9. Restore drill

Set a hard timeout before you start. Both the restore and the later backup step
can sit for hours; if it is still `creating` or `backing-up` after 30 minutes,
stop and report rather than waiting or retrying around it. The first drill
(26 November) sat for about nine hours and then produced an empty database
because the restore point predated the first migrations. Check
`LatestRestorableTime` on the source before restoring, and give the scratch
instance a new identifier each run.

```powershell
aws rds restore-db-instance-to-point-in-time --profile mandi `
  --source-db-instance-identifier mandi-staging `
  --target-db-instance-identifier mandi-staging-restore `
  --restore-time 2026-11-24T00:00:00Z `
  --db-instance-class db.t4g.micro `
  --db-subnet-group-name mandi-staging `
  --vpc-security-group-ids <db-security-group-id> `
  --no-publicly-accessible
```

Once available, connect from the app instance (the RDS endpoint is private):

```powershell
aws ssm send-command --profile mandi `
  --instance-ids <instance-id> `
  --document-name AWS-RunShellScript `
  --parameters "commands=docker run --rm --network host -e PGPASSWORD=<master-password> postgres:16-alpine psql -h <restore-endpoint> -U mandi_admin -d mandi -c 'select count(*) from web.users;'"
```

Delete the scratch instance afterwards:

```powershell
aws rds delete-db-instance --profile mandi `
  --db-instance-identifier mandi-staging-restore --skip-final-snapshot
```

## 10. Cost controls

- Budget `mandi-staging-monthly` (default $50) emails `info@joinmandi.com` at
  **25, 50, 60, 70, 80, 90 and 100%**, plus a 100% forecast alert.
- Enable Cost Explorer once: Billing and Cost Management → Cost Explorer.
- CloudWatch alarms notify the same address for instance status, RDS CPU and
  RDS free storage.

## 11. Teardown

RDS has deletion protection. Disable it first, then destroy:

```powershell
aws rds modify-db-instance --profile mandi `
  --db-instance-identifier mandi-staging --no-deletion-protection --apply-immediately
```

```powershell
cd infra
terraform destroy -var-file=envs/staging.tfvars
```

The state bucket and lock table live in `infra/bootstrap`; destroy those only
when the project is finished.
