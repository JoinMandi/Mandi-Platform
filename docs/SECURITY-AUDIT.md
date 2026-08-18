# Mandi-Platform — Security & System Audit

_Audit date: 2026-08-18. Scope: `devbusi/Mandi-Platform` @ `main` (commit 5f9a0fb). Read-only review of middleware, auth guards, all admin server actions, the admin API route, every service-role call site, the full `supabase/schema.sql` RLS, config/secret files, and the POPIA/consent path._

## Verdict

Strong security posture. RLS is enabled on every table, privilege escalation is blocked by both a DB trigger and app-layer guards, admin PII is masked, no secrets are committed, and there is no raw SQL. The findings below are mostly hardening plus two RLS/MFA design holes. Nothing here is a live critical breach.

## System shape (for context)

Next.js 14 App Router + Supabase (Postgres + RLS + Auth/TOTP MFA), deployed to Netlify. Strict layered architecture: Presentation → Application (server actions + one API route) → Domain (`src/lib/domain`, pure) → Data (`src/server/data`, the only place `supabase.from()` is allowed) → Database. Three auth gates must all agree: edge middleware → server-action guard (`requireAdmin` / `requireAdminAal2` / `requireSuperadmin` in `src/server/auth.ts`) → RLS policies (`is_admin()`, `is_admin_aal2()`, `is_superadmin_aal2()`). See `docs/ARCHITECTURE.md`.

Core product: a 56-question menopause assessment → normalized MenoScore (0–100, three bands) → one of 7 personas (safety-first "colleen" wins) → preference-ordered roadmap; Q17 self-harm scored separately and routed to the SADAG crisis line. The "Mandi Blanket" is a deterministic generative patchwork, one fabric patch per answered question.

## Resolved 2026-08-18

- **#1 Security headers** — added via `next.config.js` `headers()` (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); verified emitting in prod.
- **#2 Consent** — now recorded server-side into `sessions` via `recordConsent()` (`src/server/actions/consent.ts` → `src/server/data/sessions.ts`); session id is linked onto the questionnaire response.
- **#3 RLS write** — `qr_insert_any` bound to `user_id = auth.uid() or user_id is null`. **Requires re-running `supabase/schema.sql` against the DB to take effect.**
- **#4 MFA wipe** — `wipeMyMfaFactors` now deletes only *unverified* factors, so an AAL1 session can't strip verified MFA.

## Findings (prioritized)

| # | Sev | Area | File | What exists / what's missing |
|---|-----|------|------|------------------------------|
| 1 | **High** | Security headers | `next.config.js`, `netlify.toml` | No CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy anywhere. Admin panel is clickjackable; no CSP on a health-data platform. Add a `headers()` block or Netlify `[[headers]]`. |
| 2 | **Med-High** | POPIA consent | `src/app/consent/page.tsx:16` | Consent written only to `localStorage` (`mandi-consent`). The `sessions` table has `popia_consent`/`popia_consent_at` columns but nothing writes them (`questionnaire.ts:751` sets `session_id: null`). No durable, auditable server-side consent record — a POPIA accountability gap. |
| 3 | **Med** | RLS — health-data write | `supabase/schema.sql:446` (`qr_insert_any … with check (true)`) | Any caller can INSERT a `questionnaire_responses` row with an arbitrary `user_id` (health-data spoofing/pollution). The server action sets it correctly, but RLS is the real boundary and doesn't bind `user_id = auth.uid()`. Contrast `symptom_logs`/`checkins`, which bind correctly (`schema.sql:538,545`). |
| 4 | **Med** | MFA downgrade | `src/server/actions/admin-mfa.ts:66` (`wipeMyMfaFactors`) | Gated only by `getSessionUser` (AAL1, password-only) yet uses the service role to delete all factors including verified TOTP. A stolen password-only session can wipe verified MFA. Require AAL2, or only delete `unverified` factors. |
| 5 | **Med** | MFA not required to READ health data | `schema.sql:449,460`; `auth.ts:59-90` | Admin PII/health reads require `is_admin()` but not AAL2 (only the audit log and app-layer writes enforce AAL2). Also `requireAdminAal2`/`requireSuperadmin` skip AAL2 when the MFA probe errors (`mfaAvailable=false`) — enforcement depends on external Supabase project config, not codified in the repo. If MFA isn't enabled project-side, all admins operate at AAL1. |
| 6 | **Low** | Session validation | `middleware.ts:11`, `api/admin/delete-user/route.ts:13`, `auth.ts:8` | Uses `getSession()` for authz instead of `getUser()` (Supabase's documented guidance revalidates with the auth server). JWT is signed so forgery is impractical, but this is the flagged anti-pattern across all guards. |
| 7 | **Low** | Authz bug (fails closed) | `api/admin/delete-user/route.ts:24` | `me?.role !== "admin"` rejects `superadmin` (inconsistent with `requireAdmin`, which treats superadmin as a superset). Not a vuln — superadmins simply can't delete users via the API. |
| 8 | **Low** | CSRF on route handler | `api/admin/delete-user/route.ts` | State-changing POST reading cookies, no origin/CSRF check. Mitigated by AAL2 requirement + JSON preflight. Server actions get Next 14's built-in origin check; this raw route does not. |
| 9 | **Low/Info** | Audit durability | `src/server/data/audit.ts:26-40` | `insertAuditLog` swallows all errors — role change / user delete succeed even if the audit write fails (silent unlogged mutations). Consider failing the op if audit fails for high-sensitivity actions. |
| 10 | **Info** | Right-to-erasure | `src/server/actions/account.ts` | No self-service account deletion for data subjects; erasure is admin-only. Admin path itself is solid: real hard delete via `service.auth.admin.deleteUser` with `ON DELETE CASCADE`, dual-logged to `popia_deletion_log` + `admin_audit_log`. |
| 11 | **Info** | Auth rate limiting | `auth/login`, `auth/signup` | No app-layer rate limiting; relies on Supabase built-in limits. |
| 12 | **Info** | Dependency / CVE | `package.json` | Pinned `next@14.2.3` is affected by CVE-2025-29927 (header-based middleware auth bypass, patched 14.2.25). **Impact here is limited** by defense-in-depth: admin server actions independently call `requireAdminAal2` and RLS is a hard backstop, so bypassing middleware alone does not expose admin data. Still: bump to the latest 14.2.x (or 14.2.25+) as routine hygiene, since middleware is the first gate. |

## Solid (verified, no action needed)

- RLS enabled on **every** table incl. all health tables; read policies scope to `auth.uid()`, admin reads via `is_admin()` SECURITY DEFINER, audit log via `is_superadmin_aal2()`.
- Privilege-escalation defense in depth: `protect_user_role` trigger (`schema.sql:312-344`) + app-layer `requireSuperadmin`/`requireAdminAal2` with post-update re-read verification (`admin-roles.ts:96-103`).
- Service-role usage contained: all 7 call sites server-only and gated; `service.ts` never carries `NEXT_PUBLIC_`.
- Secrets: `.env*.local` gitignored; example is key-names only; no secret committed.
- No SQL injection: `src/server/data/*` uses the query builder throughout, no raw SQL / `.rpc` string interpolation.
- Open-redirect safe: middleware validates `next` (`startsWith("/") && !startsWith("//")`).
- PII minimization: non-superadmin admins see masked emails (`privacy.ts maskEmail`, fixed-length; covered by `privacy.test.ts`).

## Fix first

1. Add security headers (#1) — one config block, large blast-radius reduction.
2. Bind `questionnaire_responses` INSERT to `auth.uid()` in RLS, or accept null-only for anon (#3).
3. Record consent server-side into `sessions.popia_consent` (#2); require AAL2 on `wipeMyMfaFactors` (#4).
4. Bump `next` off 14.2.3 (#12).
