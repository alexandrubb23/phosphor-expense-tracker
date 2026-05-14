# Project Memory — Personal Expense Tracker

## What this project is
A full-stack personal finance app for logging income and expenses. Built primarily as a vehicle for learning to work with AI agents. The key differentiator is AI-assisted transaction entry via inbound email (SendGrid → webhook → GPT-4o extraction → ledger).

## Repository layout
```
AlexB/                        ← monorepo root (Bun workspaces)
├── package.json              ← workspace root, scripts: dev / build / lint
├── bun.lock
├── frontend/                 ← Vite + React + TypeScript (port 5173)
│   ├── src/
│   │   ├── types.ts          ← shared Transaction type, CATEGORIES const
│   │   ├── categoryColors.ts ← CATEGORY_COLORS map
│   │   ├── App.tsx           ← router only (Routes + Route declarations)
│   │   ├── pages/            ← one file per route
│   │   │   ├── HomePage.tsx
│   │   │   └── LoginPage.tsx
│   │   ├── components/       ← organised by domain
│   │   │   ├── auth/         ← session, access control
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── SignOutButton.tsx
│   │   │   ├── transactions/ ← transaction-domain UI
│   │   │   │   ├── Summary.tsx
│   │   │   │   ├── SpendingByCategory.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   └── TransactionList.tsx
│   │   │   └── ui/           ← generic, domain-agnostic UI
│   │   │       ├── button.tsx        ← shadcn Button (Base UI)
│   │   │       ├── card.tsx          ← shadcn Card
│   │   │       ├── form.tsx          ← shadcn form primitives + FormInputField
│   │   │       ├── input.tsx         ← shadcn Input (Base UI)
│   │   │       ├── label.tsx         ← shadcn Label
│   │   │       ├── Clock.tsx
│   │   │       ├── FormRootError.tsx ← reusable root error alert for forms
│   │   │       ├── Masthead.tsx
│   │   │       ├── SectionHead.tsx
│   │   │       └── HealthStatus.tsx  ← polls GET /api/health every 30 s
│   │   └── lib/
│   │       └── auth-client.ts ← Better Auth React client (signIn, signOut, useSession)
│   └── vite.config.ts        ← proxies /api → localhost:3000, `@` alias → ./src
├── backend/                  ← Express 5 + TypeScript, run with Bun (port 3000)
│   └── src/
│       ├── index.ts          ← app entry, CORS, JSON middleware
│       ├── lib/
│       │   ├── auth.ts       ← Better Auth server config
│       │   └── prisma.ts     ← Prisma client singleton
│       └── routes/
│           ├── auth.ts       ← Better Auth handler mounted at /api/auth/**
│           └── health.ts     ← GET /api/health → { status, timestamp }
└── expense-tracker/          ← original JSX prototype — keep for reference only
```

## Tech stack
| Layer | Choice |
|---|---|
| Runtime / package manager | Bun |
| Frontend | Vite 7 + React 19 + TypeScript 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| UI components | shadcn/ui (style: `base-nova`, backed by **Base UI** — not Radix) |
| Forms | react-hook-form + zod (resolver: `@hookform/resolvers/zod`) |
| Backend | Express 5 + TypeScript 5, executed with `bun --watch` |
| ORM | Prisma (PostgreSQL) — not yet scaffolded |
| Auth | Better Auth (Express adapter, database sessions — no JWTs) |
| Charts | Recharts |
| AI extraction | Vercel AI SDK + OpenAI GPT-4o + Zod schemas |
| Email ingestion | SendGrid Inbound Parse → Express webhook |
| Deployment | Vercel (frontend) + Railway/Render (backend + DB) |

## Dev commands
```bash
bun run dev                        # start both workspaces concurrently
bun run --filter frontend dev      # Vite HMR on :5173
bun run --filter backend dev       # Express with bun --watch on :3000
bun run --filter frontend build    # production build
cd frontend && npx tsc --noEmit    # type-check frontend
```

## Key conventions
- All frontend source is TypeScript (`.ts` / `.tsx`). No `.js` / `.jsx` in `frontend/`.
- Shared domain types live in `frontend/src/types.ts`. Import from there, do not redeclare.
- Use `@/` alias for all internal frontend imports (`@/` maps to `frontend/src/`).
- Express routes are Express `Router` instances exported from `backend/src/routes/`.  
  Mount them in `backend/src/index.ts` under `/api/<resource>`.
- CORS is configured in `backend/src/index.ts`; `credentials: true` is required for session cookies.
- The Vite dev server proxies all `/api` requests to `http://localhost:3000` — no absolute URLs needed in frontend fetch calls.
- Use database-persisted sessions (Better Auth). Never use JWTs.
- Soft-delete transactions (set `deleted_at`), never hard-delete.
- Single currency for v1: **RON**.

## Frontend component organisation
Components live under `frontend/src/components/` and are organised by domain:
- `auth/` — authentication and access control (e.g. `ProtectedRoute`, `SignOutButton`, `LoginForm`)
- `transactions/` — transaction-domain UI (e.g. `Summary`, `TransactionForm`)
- `ui/` — generic, domain-agnostic primitives (e.g. `Masthead`, `SectionHead`, `Clock`, shadcn components)

When creating a new component, place it in the folder matching its domain. If it could belong to multiple domains, prefer `ui/`.  
Route-level components go in `frontend/src/pages/` (one file per route).

## UI & design system
- Dark cyberpunk theme. Custom Tailwind CSS variables defined in `frontend/src/index.css` under `@theme`.
- Key color tokens: `bg` (#03060a), `cyan` (#00e5ff), `red` (#ff3a5c), `ink` (text), `surface`, `panel`, `hairline-glow`.
- Fonts: `IBM Plex Mono` (display/mono), `IBM Plex Sans` (body).
- The body background (`#03060a`) is **not** overridden by shadcn's `bg-background` — do not re-add `@apply bg-background` to `body`.
- shadcn components are in `frontend/src/components/ui/`. Add new ones with `npx shadcn@latest add <component>`.

## Forms
- Use **react-hook-form** + **zod** for all forms. Resolver: `@hookform/resolvers/zod`.
- Always set `defaultValues` in `useForm` to avoid Zod "expected string, received undefined" errors.
- Reusable shadcn form primitives live in `src/components/ui/form.tsx`:
  - `FormInputField` — labeled input with error message (use for text/email/password fields)
  - `FormRootError` — displays root-level server errors (use `<FormRootError message={errors.root?.message} />`)
  - `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` — lower-level building blocks for custom layouts

## Error handling
Never call `res.status(...).json(...)` directly in route handlers or middleware.
Always throw (or `next()`) an `HttpError` subclass — the global `errorHandler` middleware (mounted last in `index.ts`) handles the response uniformly.

```ts
// ✅ correct
import { HttpNotFoundError, HttpUnauthorizedError } from "../lib/http-errors";

throw new HttpNotFoundError("Transaction not found");
throw new HttpUnauthorizedError();

// In middleware, forward via next():
return next(new HttpUnauthorizedError());

// ❌ wrong — never do this
res.status(404).json({ error: "Not found" });
```

Available error classes (`backend/src/lib/http-errors.ts`):
| Class | Status |
|---|---|
| `HttpBadRequestError` | 400 |
| `HttpUnauthorizedError` | 401 |
| `HttpForbiddenError` | 403 |
| `HttpNotFoundError` | 404 |
| `HttpConflictError` | 409 |
| `HttpPayloadTooLargeError` | 413 |
| `HttpUnprocessableError` | 422 |

Add new subclasses to `http-errors.ts` as needed. Unknown errors fall through to a generic 500 response.

## Authentication

### Strategy
- **Better Auth** with email/password. **No JWTs** — sessions are database-persisted cookies.
- Sign-up is **disabled** (`disableSignUp: true`). Users are seeded directly in the database (see `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars). This is a single-user personal finance app.
- Users have a `role` field (default `"user"`) added via `additionalFields`.

### Backend
- Better Auth server is configured in `backend/src/lib/auth.ts`.
- The handler is mounted in `backend/src/index.ts` **before** `express.json()` (Better Auth parses its own body):
  ```ts
  app.all("/api/auth/{*splat}", authHandler);
  ```
- Required env vars:
  | Variable | Description |
  |---|---|
  | `BETTER_AUTH_SECRET` | Random secret ≥ 32 chars |
  | `BETTER_AUTH_URL` | Backend origin e.g. `http://localhost:3000` |
  | `FRONTEND_URL` | Added to `trustedOrigins` for CORS |
  | `DATABASE_URL` | PostgreSQL connection URL |
  | `SEED_ADMIN_EMAIL` | Email for the seeded admin user |
  | `SEED_ADMIN_PASSWORD` | Password for the seeded admin user (≥ 8 chars) |

### Frontend
- Auth client is in `src/lib/auth-client.ts` — exports `signIn`, `signOut`, `useSession` from `better-auth/react`.
- **`useSession()`** returns `{ data: session, isPending }`. Use this to check auth state in components.
- **Login flow**: `signIn.email({ email, password })` → on success navigate to `/` with `state: { fromLogin: true }`.
- **Sign-out flow**: `signOut({ fetchOptions: { onSuccess: () => navigate("/login") } })`.
- **Route protection**: `ProtectedRoute` wraps all authenticated routes. It uses `useSession()` and redirects to `/login` if no session. It also handles a short `settling` delay after login to avoid a flash before the session propagates.

### Routing
```
/login       → LoginPage (public)
/*           → ProtectedRoute → HomePage (requires session)
```

### Adding auth to a new API route (backend)
Use Better Auth's `auth.api.getSession` to verify the session in protected route handlers:
```ts
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { HttpUnauthorizedError } from "../lib/http-errors.js";

const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
if (!session) throw new HttpUnauthorizedError();

const userId = session.user.id;
```

## Domain model (planned, Prisma not yet added)
- **User** — owns everything; no cross-user data access.
- **Account** — a wallet/bank account belonging to a user.
- **Category** — fixed top-level (Food, Housing, Utilities, Transport, Entertainment, Salary, Other) + user-defined subcategories.
- **Transaction** — description, amount, operation_type (inflow/outflow), category, subcategory?, account, date, status (committed | pending), deleted_at.
- **EmailWhitelist** — email addresses allowed to submit transactions via email for a given user.

## AI email ingestion flow
1. SendGrid Inbound Parse → `POST /api/webhooks/email`
2. Check sender against `EmailWhitelist` — reject if not listed.
3. Pass email body to GPT-4o via Vercel AI SDK with a Zod schema for `{ description, amount, operationType, category, subcategory?, account? }`.
4. **Confident** (all required fields extracted) → commit directly to ledger.
5. **Low-confidence** (any required field uncertain) → create `status: pending` record in review queue.
6. User reviews pending items in the UI: confirm / edit / discard.

## Using Context7 for up-to-date documentation
When writing or modifying code that touches any library in this project, **always resolve documentation through Context7** before implementing. Do not rely on training-data knowledge for API details — library APIs change.

### Library IDs
| Library | Context7 ID |
|---|---|
| Bun | `/oven-sh/bun` |
| Express 5 | `/websites/expressjs_en_5` |
| Vite | `/vitejs/vite` |
| React | `/facebook/react` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss` |
| shadcn/ui | `/shadcn-ui/ui` |
| react-hook-form | `/react-hook-form/react-hook-form` |
| Zod | `/colinhacks/zod` |
| Prisma | `/prisma/prisma` |
| Better Auth | `/better-auth/better-auth` |
| Vercel AI SDK | `/vercel/ai` |
| Recharts | `/recharts/recharts` |
| TypeScript | `/microsoft/typescript` |

### How to use Context7
Before implementing anything non-trivial with a listed library, call:
1. `context7-resolve-library-id` with the library name to confirm the ID.
2. `context7-query-docs` with the confirmed ID and a specific query (e.g. `"Express 5 router TypeScript setup"`, `"Better Auth database session Express adapter"`).
Use the returned snippets to write correct, up-to-date code.
