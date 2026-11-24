# JoinMandi — engineering guide

JoinMandi is South Africa's multilingual women's health platform for menopause
(English, isiZulu, isiXhosa, Afrikaans). Next.js 14 (App Router) + TypeScript +
Tailwind + Postgres on AWS `af-south-1`. Identity is AWS Cognito (TOTP MFA,
groups for roles). Phase 0 staging: internal only; Phase 1 launch: August 2026.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (also runs typecheck)
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npm run test:db` — RLS/authorisation tests against the local database
- `npm run db:setup` — provision roles, migrate, seed (local)
- `npm run db:migrate` / `npm run db:rollback` — versioned migrations

## Architecture — layered, with a strict dependency rule

A layer may only call the layer **below** it. Never sideways into a peer, never
upward.

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Presentation | `src/app/**`, `src/components/**` | UI only — render props, emit events. |
| Application | `src/server/actions/**`, `src/app/api/**` | Server Actions + Route Handlers: auth/role checks, orchestration. |
| Domain | `src/lib/domain/**` | Pure business logic, no I/O (scoring, questions, roadmap). |
| Data access | `src/server/data/**` | The ONLY place SQL/`pg` queries are allowed. One module per entity. |
| Database | Postgres (RDS) + RLS | Versioned migrations in `db/migrations/`. |

## Hard rules

1. **SQL and `pg` may appear only in `src/server/data/**`.** Pages, components,
   and actions never query the database directly.
2. **Database clients** come from `src/server/db/*` — `pool` (app role, RLS
   enforced), `servicePool` (RLS-bypassing; privileged ops only), and
   `withUser` (sets the request identity inside a transaction).
3. **No row types in components or pages.** Import table shapes from
   `src/lib/types/database.ts` and composed shapes from `src/lib/types/models.ts`.
   Keep `database.ts` in step with `db/migrations/`.
4. **Mutations go through Server Actions** in `src/server/actions/**`, which call
   the data layer and `revalidatePath`. Components do not mutate data directly.
5. **Auth/role checks** use the guards in `src/server/auth.ts` and
   `src/server/auth/guards.ts` (`requireAdmin`, `requireRole`,
   `getSessionUser`) — not ad-hoc role lookups.
6. **Business logic stays in `src/lib/domain/**`** — pure functions, no I/O, no
   React. Components and actions call domain functions; they do not inline rules.
7. **Data-layer functions take a `Db` argument** (dependency injection) so the
   caller picks the right pool/client and the function stays testable.
8. **RLS is the real security gate.** Migrations in `db/migrations/` enable it on
   every table; `src/server/data/rls.test.ts` must stay green.

## Directory map

```
src/
  app/                   # routes — thin
  components/ui|questionnaire|admin|layout
  server/
    db/                  # pg pools, withUser() transaction, health check
    auth/                # Cognito OIDC, sealed session, guards
    data/                # data-access layer (repositories, SQL)
    actions/             # server actions (application layer)
    auth.ts              # requireAdmin() / getSessionUser()
  lib/
    domain/              # pure business logic
    types/               # database.ts (rows) + models.ts (DTOs)
    i18n.ts
  middleware.ts
```

## Testing expectation

- **Domain** — unit tests (pure functions; highest priority, e.g. scoring).
- **Data** — test with an injected fake `Db`, or against the real local
  Postgres for RLS (`src/server/data/rls.test.ts`).
- **Application** — integration tests for actions.
- Co-locate tests as `*.test.ts` beside the code.

## Refactor-what-doesn't-fit

When you edit a file that breaks these rules, bring it into line as part of the
change — don't add to the debt. Flag larger restructures rather than doing them
silently mid-task.

## Project notes

- UI strings live in `public/locales/{en,zu,xh,af}/common.json` (i18next) — not
  in the database.
- The database is multilingual: editorial content (`content`, `events`) is a
  canonical row + a `*_translations` child table. RLS is the real security gate.
- POPIA compliance matters — never store patient PII in `clinical_screenings`;
  user deletion is audited in `popia_deletion_log`.
- Brand palette and tone: warm, non-clinical. See `tailwind.config.ts`.
