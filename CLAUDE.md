# JoinMandi — engineering guide

JoinMandi is South Africa's multilingual women's health platform for menopause
(English, isiZulu, isiXhosa, Afrikaans). Next.js 14 (App Router) + TypeScript +
Tailwind + Supabase. Phase 1 launch: August 2026.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (also runs typecheck)
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests

## Architecture — layered, with a strict dependency rule

A layer may only call the layer **below** it. Never sideways into a peer, never
upward.

| Layer | Lives in | Responsibility |
|-------|----------|----------------|
| Presentation | `src/app/**`, `src/components/**` | UI only — render props, emit events. |
| Application | `src/server/actions/**`, `src/app/api/**` | Server Actions + Route Handlers: auth/role checks, orchestration. |
| Domain | `src/lib/domain/**` | Pure business logic, no I/O (scoring, questions, roadmap). |
| Data access | `src/server/data/**` | The ONLY place `supabase.from()` is allowed. One module per entity. |
| Database | Supabase/Postgres + RLS | `supabase/schema.sql`. |

## Hard rules

1. **`supabase.from(...)` may appear only in `src/server/data/**`.** Pages,
   components, and actions never query Supabase directly.
2. **Supabase clients** come from `src/server/supabase/*` — `browser` (client
   components), `server` (server components / actions / routes), `service`
   (RLS-bypassing; privileged ops only), `middleware`.
3. **No row types in components or pages.** Import table shapes from
   `src/lib/types/database.ts` and composed shapes from `src/lib/types/models.ts`.
   `database.ts` is the single source of truth — regenerate it with
   `supabase gen types typescript` once the project is provisioned.
4. **Mutations go through Server Actions** in `src/server/actions/**`, which call
   the data layer and `revalidatePath`. Components do not mutate data directly.
5. **Auth/role checks** use the guards in `src/server/auth.ts` (`requireAdmin`,
   `getSessionUser`) — not ad-hoc `is_admin` lookups.
6. **Business logic stays in `src/lib/domain/**`** — pure functions, no I/O, no
   React. Components and actions call domain functions; they do not inline rules.
7. **Data-layer functions take a `SupabaseClient` argument** (dependency
   injection) so the caller picks the right client and the function stays testable.

## Directory map

```
src/
  app/                   # routes — thin
  components/ui|questionnaire|admin|layout
  server/
    supabase/            # client factories
    data/                # data-access layer (repositories)
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
- **Data** — test with an injected fake/mock Supabase client.
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
