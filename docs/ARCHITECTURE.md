# JoinMandi — System Architecture

A reference for engineers working in this repo. Four focused Mermaid diagrams
cover the layered stack, the auth + MFA flow, the admin MFA state machine, and
the dual-path translation system. Each diagram is followed by a short caption
linking into the source.

The canonical rules (the "what may call what" dependency rule, where
`supabase.from()` is allowed, etc.) live in [CLAUDE.md](../CLAUDE.md). This
document shows the **shape** — boxes, arrows, and the security boundaries.

**Out of scope today** (so you don't go hunting):

- No external integrations — no email/SMS provider, no payments, no analytics
  SDK, no maps, no file storage beyond Supabase. Supabase Auth sends its own
  confirmation emails.
- No background workers, cron jobs, or queues. Every flow is request →
  response.
- The editorial **authoring** workflow (who writes the JSON, how Dr Bango's
  clinical review is tracked) is a process question, not architecture — see
  [public/locales/TRANSLATION-NOTES.md](../public/locales/TRANSLATION-NOTES.md)
  and [public/locales/CLINICAL-REVIEW.md](../public/locales/CLINICAL-REVIEW.md).

---

## 1. Layered system overview

The stack obeys a strict downward dependency rule: Presentation → Application
→ Domain → Data → Database. No sideways calls inside a layer, no upward calls.
The middleware sits at the request edge; the Supabase client factories are a
side-rail used by data-layer modules and the middleware.

![Layered system overview](diagrams/1-layered-overview.svg)

<details>
<summary>Mermaid source (edit me)</summary>

```mermaid
flowchart TD
    subgraph EDGE["Request edge"]
        MW["middleware.ts<br/>session refresh + route gate"]
    end

    subgraph PRES["Presentation — src/app, src/components"]
        ROUTES["12 routes<br/>about · admin · auth · consent · events<br/>find-a-doctor · honour-the-mothers · language<br/>my-journey · questionnaire · resources · roadmap<br/>truth-about-hrt"]
        COMP["components/ui · components/admin<br/>NavBar · I18nProvider"]
    end

    subgraph APP["Application — src/server/actions, src/app/api"]
        ACTIONS["16 server actions<br/>account · admin · admin-crm · admin-invite<br/>admin-mfa · admin-roles · clinics · content<br/>doctors · engagement · events · journey<br/>me · questionnaire · stories · users"]
        ROUTE["api/admin/delete-user<br/>(only route handler)"]
        AUTH["server/auth.ts<br/>requireAdmin · requireAdminAal2<br/>requireSuperadmin · getSessionUser"]
    end

    subgraph DOM["Domain — src/lib/domain (pure, no I/O)"]
        DOMAIN["crm · privacy · questions<br/>quilt · scoring"]
    end

    subgraph DATA["Data — src/server/data (only place supabase.from is allowed)"]
        REPOS["15 entity modules<br/>audit · checkins · clinics · content · deletion-log<br/>doctors · engagement · events · feedback · languages<br/>questionnaire · screenings · stories · symptom-logs · users"]
    end

    subgraph DB["Database — Supabase"]
        PG["Postgres + RLS<br/>18 tables (schema.sql)"]
        SBAUTH["Supabase Auth<br/>auth.users + auth.mfa_factors"]
    end

    subgraph FACT["Supabase client factories — src/server/supabase"]
        BROW["browser"]
        SRV["server / action / route"]
        SVC["service<br/>(bypasses RLS)"]
        MWC["middleware"]
    end

    MW -.session.-> PRES
    PRES --> ACTIONS
    PRES --> ROUTE
    ACTIONS --> AUTH
    ROUTE --> AUTH
    ACTIONS --> DOMAIN
    ACTIONS --> REPOS
    REPOS --> PG
    AUTH --> SBAUTH
    REPOS -. uses .-> SRV
    REPOS -. uses .-> SVC
    PRES -. client only .-> BROW
    MW --> MWC
    MWC --> SBAUTH

    classDef edge fill:#efe0d4,stroke:#a87a5a,color:#3a2a1a
    classDef pres fill:#f5d6d6,stroke:#a85a5a,color:#3a1a1a
    classDef app fill:#cfdcc4,stroke:#5a8a4a,color:#1a2a1a
    classDef dom fill:#e8c89a,stroke:#a87a3a,color:#3a2a0a
    classDef data fill:#e8dcc0,stroke:#a89a5a,color:#3a2a0a
    classDef db fill:#cfa8c0,stroke:#7a4a6a,color:#2a1a2a
    classDef fact fill:#dcd0e8,stroke:#6a5a8a,color:#2a1a3a

    class MW edge
    class ROUTES,COMP pres
    class ACTIONS,ROUTE,AUTH app
    class DOMAIN dom
    class REPOS data
    class PG,SBAUTH db
    class BROW,SRV,SVC,MWC fact
```

</details>

**Read the layers in the code:** routes in [src/app/](../src/app),
shared components in [src/components/](../src/components), server actions in
[src/server/actions/](../src/server/actions), guards in
[src/server/auth.ts](../src/server/auth.ts), pure logic in
[src/lib/domain/](../src/lib/domain), data access in
[src/server/data/](../src/server/data), schema in
[supabase/schema.sql](../supabase/schema.sql).

> **Where do I add a new admin action that requires MFA?** Add the function to
> a file under [src/server/actions/](../src/server/actions); call
> `await requireAdminAal2()` (or `requireSuperadmin()`) from
> [src/server/auth.ts](../src/server/auth.ts) at the top; do all writes through
> a [src/server/data/](../src/server/data) module — never `supabase.from()`
> from the action directly.

---

## 2. Auth + MFA flow

Three sequential gates protect privileged operations: the **edge middleware**,
the **server-action guard**, and the **RLS policy** in Postgres. All three must
agree before a write lands. The diagram shows a regular user landing on
`/my-journey` then an admin elevating to AAL2 to access `/admin/security`.

![Auth and MFA flow](diagrams/2-auth-mfa-flow.svg)

<details>
<summary>Mermaid source (edit me)</summary>

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant MW as middleware.ts
    participant P as Page / AdminShell
    participant SA as Server Action
    participant G as auth.ts guard
    participant SB as Supabase Auth
    participant DB as Postgres + RLS

    Note over B,DB: Regular user login
    B->>MW: GET /my-journey
    MW->>SB: refresh session (createMiddlewareSupabase)
    MW-->>B: 302 /auth/login?next=/my-journey (no session)
    B->>P: GET /auth/login
    B->>SB: signInWithPassword(email, pw)
    SB-->>B: AAL1 JWT (cookie)
    B->>MW: GET /my-journey
    MW->>SB: session ok
    MW-->>B: render page

    Note over B,DB: Admin elevation to AAL2
    B->>P: GET /admin
    P->>SA: fetchAdminContext()
    SA->>G: getSessionUser + role probe
    G->>SB: mfa.getAuthenticatorAssuranceLevel()
    SB-->>G: { currentLevel: aal1, nextLevel: aal2, hasFactor: false }
    G-->>SA: mfaGap = true
    SA-->>P: { mfaGap: true }
    P-->>B: client redirect /admin/security
    B->>SB: mfa.enroll({factorType: totp})
    SB-->>B: QR + secret
    B->>SB: mfa.challenge(factorId)
    B->>SB: mfa.verify(challengeId, code)
    SB-->>B: AAL2 JWT (cookie refreshed)

    Note over B,DB: Privileged write (e.g. promote user)
    B->>SA: setUserRole(targetId, role)
    SA->>G: requireAdminAal2()
    G->>SB: getAuthenticatorAssuranceLevel()
    SB-->>G: currentLevel = aal2
    G-->>SA: ok
    SA->>DB: update users.role
    DB->>DB: RLS: is_admin_aal2() check
    DB-->>SA: row updated
    SA-->>B: success
```

</details>

**Key entry points:**
[src/middleware.ts](../src/middleware.ts) (session refresh + route gate),
[src/app/auth/login/page.tsx](../src/app/auth/login/page.tsx) (`signInWithPassword`),
[src/components/admin/AdminShell.tsx](../src/components/admin/AdminShell.tsx)
(reads `fetchAdminContext`, redirects on `mfaGap`),
[src/app/admin/security/page.tsx](../src/app/admin/security/page.tsx) (TOTP
enroll → challenge → verify),
[src/server/auth.ts](../src/server/auth.ts)
(`requireAdmin`, `requireAdminAal2`, `requireSuperadmin`),
[supabase/schema.sql](../supabase/schema.sql) (`is_admin_aal2()` and
`is_superadmin_aal2()` SQL helpers that policies call).

**Defense-in-depth:** if the middleware misses a route, the server-action guard
still blocks. If the guard is forgotten, RLS still blocks. If RLS is wrong, the
service-role client is the only escape — and that client lives in one file
([src/server/supabase/service.ts](../src/server/supabase/service.ts)) you can
audit by hand.

---

## 3. Admin MFA state machine

The admin's MFA status, as the client sees it on `/admin/security`. The "wipe
stuck factors" transition is the escape hatch when an unverified enrolment gets
orphaned — it is the only state change that needs the service-role client.

![Admin MFA state machine](diagrams/3-mfa-state-machine.svg)

<details>
<summary>Mermaid source (edit me)</summary>

```mermaid
stateDiagram-v2
    [*] --> loading
    loading --> needsFactor: no MFA factor
    loading --> needsChallenge: factor exists, AAL1
    loading --> enrolled: AAL2 already
    needsFactor --> needsChallenge: mfa.enroll → QR shown → user scans
    needsChallenge --> enrolled: mfa.challenge + mfa.verify ok
    needsChallenge --> needsFactor: wipeMyMfaFactors() ⚙ service-role
    enrolled --> needsFactor: wipeMyMfaFactors() ⚙ service-role
    enrolled --> [*]: privileged work allowed

    note right of needsFactor
      User-scoped client:
      supabase.auth.mfa.enroll()
    end note
    note right of needsChallenge
      User-scoped client:
      mfa.challenge() then mfa.verify()
    end note
    note left of enrolled
      Server-action guard:
      requireAdminAal2()
      checks currentLevel equals aal2
    end note
```

</details>

**Source:**
[src/app/admin/security/page.tsx](../src/app/admin/security/page.tsx) owns the
client state machine and stages (`loading`, `needsFactor`, `needsChallenge`,
`enrolled`).
[src/server/actions/admin-mfa.ts](../src/server/actions/admin-mfa.ts)
exposes `listMyMfaFactors()` and `wipeMyMfaFactors()` — the latter uses
[src/server/supabase/service.ts](../src/server/supabase/service.ts) to clear
orphaned factors via the Supabase Auth admin API.

---

## 4. Translation dual-path

Two pipelines, on purpose. **UI strings** (button labels, helper text, error
messages) live in JSON, ship with the bundle, and switch client-side via
i18next. **Editorial content** (articles, events) lives in Postgres with one
canonical row plus a `*_translations` child per language, and is fetched
server-side. Don't mix them.

![Translation dual-path](diagrams/4-translation-dual-path.svg)

<details>
<summary>Mermaid source (edit me)</summary>

```mermaid
flowchart LR
    subgraph A["Path A — UI strings (i18next, client-side)"]
        direction TB
        USER1["User picks language"] --> LS["localStorage<br/>mandi-lang"]
        LS --> PROV["I18nProvider<br/>changeLanguage on mount"]
        PROV --> I18N["i18next instance<br/>namespace: common<br/>fallback: en"]
        I18N --> JSON["public/locales<br/>en · zu · xh · af<br/>common.json (~543 keys)"]
        PICKERS["pickers: /language page,<br/>NavBar LanguageMenu"] --> LS
    end

    subgraph B["Path B — Editorial content (Supabase, server-side)"]
        direction TB
        SRVCOMP["Server component / action"] --> DATA["src/server/data/content.ts<br/>src/server/data/events.ts"]
        DATA -->|nested select with translations| SUPA["Postgres tables<br/>content + content_translations<br/>events + event_translations"]
        SUPA --> UI["UI filters rows by<br/>active i18n.language"]
    end

    subgraph WORKFLOW["Editorial workflow assets (out of runtime)"]
        TM["TRANSLATION-MANIFEST.md<br/>key inventory"]
        TN["TRANSLATION-NOTES.md<br/>provenance, untranslated terms"]
        CR["CLINICAL-REVIEW.md<br/>Dr Bango sign-off queue"]
    end

    JSON -.documented by.-> TM
    JSON -.documented by.-> TN
    SUPA -.gated by.-> CR

    classDef ui fill:#f5d6d6,stroke:#a85a5a,color:#3a1a1a
    classDef editorial fill:#cfa8c0,stroke:#7a4a6a,color:#2a1a2a
    classDef workflow fill:#e8dcc0,stroke:#a89a5a,color:#3a2a0a

    class USER1,LS,PROV,I18N,JSON,PICKERS ui
    class SRVCOMP,DATA,SUPA,UI editorial
    class TM,TN,CR workflow
```

</details>

**Asymmetry to know about:** only `content` and `events` use the canonical-plus-
`*_translations`-child pattern. `clinic_directory`, `doctor_profiles`, and
`stories` store language metadata inline (a `languages[]` array or a single
`language_code` field) rather than full per-language rows. If you add a new
editorial table where every language needs distinct copy, follow the
content/events pattern; if every clinic just has *one* language tag, follow the
clinics pattern.

**Source pointers:**
[src/lib/i18n.ts](../src/lib/i18n.ts) (i18next config, supported locales,
fallback chain),
[src/components/I18nProvider.tsx](../src/components/I18nProvider.tsx)
(post-mount language restore, tree re-key on change),
[src/app/language/page.tsx](../src/app/language/page.tsx) and
[src/components/ui/LanguageMenu.tsx](../src/components/ui/LanguageMenu.tsx)
(pickers),
[public/locales/en/common.json](../public/locales/en/common.json) (UI strings),
[src/server/data/content.ts](../src/server/data/content.ts) and
[src/server/data/events.ts](../src/server/data/events.ts) (joined fetches),
[supabase/schema.sql](../supabase/schema.sql) (`content_translations`,
`event_translations` tables).

> **Where do I add a new translatable editorial table?** Define the canonical
> table + a `*_translations` child with `(parent_id, language_code)` unique in
> [supabase/schema.sql](../supabase/schema.sql); add an entity module under
> [src/server/data/](../src/server/data) that selects
> `*, *_translations(*)`; expose mutations through a new
> [src/server/actions/](../src/server/actions) file. UI strings for the new
> feature go in
> [public/locales/{en,zu,xh,af}/common.json](../public/locales/en/common.json)
> and are surfaced by `useTranslation('common')`.
