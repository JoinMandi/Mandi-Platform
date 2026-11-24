# JoinMandi — team testing guide

Welcome. This document is for **everyone on the team** who's about to
play with JoinMandi before launch — Hermi, Dr Funeka, the language
moderators, and any new admins joining later. Find the section for
your role and follow it.

If you're a developer working on the codebase, scroll to the very
bottom for the engineering reference (architecture lives in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); the working plan
lives in `~/.claude/plans/im-a-developer-working-noble-minsky.md`).

---

## What JoinMandi is

South Africa's first multilingual women's-health platform for
menopause. English, isiZulu, isiXhosa, Afrikaans. A 56-question
self-questionnaire produces a **MenoScore**, a personalised
**Mandi Blanket** (the visual quilt that grows from her answers), a
**roadmap** of next steps tailored to her, and a downloadable
**doctor-ready summary** she can take to a clinician.

Phase 1 launch: August 2026. We're testing now to catch what's
missing.

## The live test URL

> `https://staging.joinmandi.co.za` *(available once the Phase 0 staging
> stack and DNS are live)*

Pick a strong password. The platform is POPIA-compliant; the test
deployment uses the same security posture as production.

---

## Roles

Four roles. You'll be invited with the right one for your job.

| Role | Who | What they can do |
|---|---|---|
| **Member** | End users (real or test) | Take the questionnaire, see their roadmap, log symptoms, read content, download their doctor summary |
| **Clinician** | Future clinical advisors | Same as Member (clinician-only surface is post-MVP) |
| **Admin** | Mandi team — moderators, content folk | All of the above plus the admin dashboard, story / event moderation, content publish, user list, user-detail drill-down |
| **Superadmin** | Founder + trusted deputies | All of the above plus inviting + promoting other admins, demoting admins, and reading the admin audit log |

You can't pick your own role — a superadmin assigns it when they
invite you. If you need a different role, ask Hermi or the
developer.

---

## For Hermi (superadmin)

You're the founder; you get the keys.

### First sign-in
1. Check your email for an invite from JoinMandi → click the link
   → set a password.
2. You'll land on `/admin` (the CRM dashboard).
3. The header shows the funnel, segments, compliance rings. Click
   around — nothing breaks anything.

### Inviting more team
1. Visit **Users** in the sidebar (`/admin/users`).
2. Click **+ Invite user**.
3. Enter the person's email and pick their role.
4. They get a magic-link email and skip the password-setup
   guesswork — your invite pre-sets their role.

### Reading the audit log
- Visit **Audit log** in the sidebar (`/admin/audit`) — superadmin
  only.
- Every role change, user delete, story moderation, event publish
  is in here. Filter by action type, scroll by day.
- POPIA paper trail: every user-detail page view is also recorded
  here, with actor + target.

### Promoting / demoting
- In **Users**, each row has a role dropdown.
- Changing to admin / superadmin requires you (only superadmins can
  mint admins).
- The system refuses to demote the last superadmin — there's
  always a way back in.

### MFA (two-factor)
- MFA is **required** for everyone. On first sign-in Cognito asks you to
  enrol an authenticator app (TOTP), and every later sign-in asks for the
  6-digit code.
- Staff accounts are created by a superadmin; there is no self-service
  staff sign-up.

---

## For Dr Funeka (admin / clinical advisor)

We need your eyes on the **clinical content** above everything else.

### First sign-in
1. Check your email for an invite from JoinMandi → click the link
   → set a password.
2. You'll land on `/admin`.

### What to review (in priority order)

1. **The 56-question questionnaire** — visit
   [`/questionnaire`](https://staging.joinmandi.co.za/questionnaire)
   from the public site (sign out first if needed; it works
   anonymously).
   - Wording of each question (especially Q16 "not feeling like
     herself" and Q17 self-harm — those are the highest-stakes).
   - Whether the answer options actually cover the realistic range.
   - Whether the persona-shaping questions (Q49–Q55) read as
     intended.
2. **Roadmap copy** — finish the questionnaire to see her
   personalised roadmap. Review the band lines, persona body
   text, and the 6 "next step" cards.
3. **Safety messaging** — when Q17 is flagged, the roadmap shows
   the SADAG safety panel. Confirm the wording + the SADAG number
   are right.
4. **Doctor-ready PDF** — sign in as a Member tester who has
   completed the questionnaire, visit `/my-journey` → "Download
   for doctor" → review the print page.
5. **Story moderation** — visit `/admin/stories` to approve /
   reject what testers submit. You can also create stories
   yourself with **+ New story** (goes through the same pending
   queue so the workflow is uniform).

### Flagging concerns
The simplest way: write directly in the shared Google Doc
*[create the doc and put its link here]* under the question / page
in question. We re-read it every Monday.

If something is **clinically dangerous** (wrong safety wording,
incorrect medication name, missing contraindication), flag it
urgently — message Hermi directly.

---

## For language moderators (isiZulu / isiXhosa / Afrikaans)

You're checking that the South African languages **feel right** to
a native speaker. The current translations are machine-generated as
a starting point; we need a real person to make them sound
human.

### First sign-in
1. Check your email for an invite from JoinMandi (the
   `mandi-test+...` address you were given) → click the link → set
   a password.
2. You'll land on `/my-journey` (your test account is a Member).

### Switching language in the app
- Top right of every page, you'll see a small language pill (e.g.
  "EN" or "ZU"). Click it → pick your language → the whole site
  switches.
- Your choice is saved in your browser; you'll keep that language
  on every visit.

### What to walk through, in your language
Go through these pages and read them like a real user would.
Anything that sounds odd, off-tone, or just plain wrong — flag it
in the sheet (below).

1. Landing page (`/`)
2. About (`/about`)
3. Honour the Mothers (`/honour-the-mothers`)
4. The questionnaire (`/questionnaire`) — at least the first 10
   questions; ideally all 56
5. The roadmap (after completing the questionnaire)
6. My journey (`/my-journey`) — including "Download for doctor"
7. Find a doctor (`/find-a-doctor`)
8. Resources (`/resources`)

### Editing translations — the Google Sheet
The developer will share a Google Sheet titled something like
**"JoinMandi translations — moderator review"**. Each row is one
piece of text in the app, with four columns:

| key (don't edit) | english (don't edit) | **isiZulu** | **isiXhosa** | **Afrikaans** | notes |
|---|---|---|---|---|---|

- Edit **only your language column**. The English is the source —
  leave it alone.
- If a cell is blank or just shows English, that means it's
  falling back to English in the app — fill it in.
- If something doesn't translate well (a brand name, a medical
  term, a cultural concept that doesn't map cleanly), write a
  short note in the **notes** column.
- We re-import your edits into the live site within 24 hours of
  you finishing a batch. Once re-imported, refresh the live site
  and you'll see your text everywhere.

### Brand names that should never be translated
"Mandi", "JoinMandi", "kykNET", "MrsKing Productions", "Hermi
King", "Dr Funeka Bango", "Sarah Baartman", "Anarcha", "Betsey",
"Lucy", "POPIA", "HRT", "MenoScore", "Meer as Warm Gloede".

---

## Known limits during the test phase

- **Two-factor auth (MFA) is required** — Cognito enforces TOTP for every
  account. `/admin/security` shows your session's MFA state; enrolment and
  recovery happen in the Cognito hosted UI.
- **Invite emails come from Cognito's default sender** during Phase 0,
  which has a daily cap. If an invite doesn't arrive within a few minutes,
  check spam or ask for a re-invite. Amazon SES is a Phase 1 task.
- **Some pages fall back to English** in zu/xh/af — the
  translations are still being filled in. That's what the
  moderator sheet is for.
- **Test data will be wiped before real launch.** All test
  accounts using the `mandi-test+...` email convention plus any
  test stories/events go.
- **The public `/events` page is hardcoded** for now (the events
  the admin team creates in `/admin/events` won't appear on the
  public page yet — that's a known Phase-23 task).

---

## Reporting issues

Single shared Google Doc:
**"JoinMandi test feedback — Aug 2026 launch"**
*[fill in the link once created]*

Format:
1. **Page** (e.g. `/questionnaire/Q16` or `/my-journey`)
2. **Language** if applicable
3. **What you saw** (one sentence)
4. **What you expected** (one sentence)
5. Screenshot if you can grab one

Urgent (clinical / safety / data) — message Hermi directly.

---

## For the developer — operational deploy reference

> *Treat this section as the runbook. Everything above is for the
> team; everything below is for the engineer at the controls.*

### One-time setup (per environment)

Staging runs on **AWS `af-south-1`**: one EC2 instance with Docker Compose
(Next.js + Caddy), RDS Postgres, Cognito for sign-in, S3 for media,
CloudWatch for logs, and Terraform for everything.

The full operational sequence — IAM identity, Terraform state bootstrap,
staging apply, the GoDaddy A record, GitHub secrets and the first staff
accounts — is in **[`docs/PHASE-0-RUNBOOK.md`](docs/PHASE-0-RUNBOOK.md)**.

Short version:

1. Create the `mandi-terraform` IAM user with
   [`infra/iam/terraform-bootstrap-policy.json`](infra/iam/terraform-bootstrap-policy.json).
2. `terraform apply` in `infra/bootstrap`, then in `infra` with
   `-var-file=envs/staging.tfvars`.
3. Add the A record for `staging.joinmandi.co.za` → the Elastic IP.
4. Set `AWS_DEPLOY_ROLE_ARN` (secret) and `APP_DOMAIN` (variable) in GitHub
   Actions; push to `main`.
5. Create the first superadmin with `/opt/mandi/seed-staff.sh` (runbook §6).

Cognito enforces TOTP MFA for every account. Roles are `member`,
`clinician`, `admin`, `superadmin`; staff accounts are created by a
superadmin, never self-service.

### Translator sheet workflow

Export:
```sh
npm run translations:export
```
Produces `translations.csv` in the repo root. Open Google Sheets
→ File → Import → upload → **Replace spreadsheet**. Share with
moderators (one combined sheet, or one per language — your call).

Re-import after moderator edits: download the sheet back as CSV,
then merge into `public/locales/{zu,xh,af}/common.json`. The
existing `gen-translations.mjs` is the closest helper; building a
proper CSV → JSON importer is a small follow-up when there's
volume.

### Local development

```sh
cp .env.example .env.local        # fill in the values
docker compose up -d db
npm run db:setup                  # roles, migrations, seed
npm install
npm run dev                       # http://localhost:3000
```

Other useful scripts:
- `npm run lint`         ESLint
- `npx tsc --noEmit`     typecheck
- `npm test`             Vitest unit tests
- `npm run test:db`      database authorisation tests (needs the local db)
- `npm run db:migrate` / `npm run db:rollback`
- `npm run build`        production build (clobbers `.next/` — DO
  NOT run while `npm run dev` is running; restart dev after if
  you do)
- `npm run translations:export`   CSV export for moderators

### Architecture pointer

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) +
[`CLAUDE.md`](CLAUDE.md) at the repo root describe the layered
architecture (`src/app` → server actions in `src/server/actions`
→ pure domain logic in `src/lib/domain` → data layer in
`src/server/data`, the only place that runs SQL).
