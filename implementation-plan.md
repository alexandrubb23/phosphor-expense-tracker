# Implementation Plan — Personal Expense Tracker

## Approach
Monorepo with two packages: `backend/` (Express + Prisma) and `frontend/` (Vite + React).
Build phase-by-phase, each phase producing a working vertical slice.

---

## Phase 1 — Project Scaffolding
Set up the monorepo structure, tooling, and shared config before writing any feature code.

- [ ] `p1-1` Init monorepo with npm workspaces (`backend/`, `frontend/`)
- [ ] `p1-2` Scaffold Express app (TypeScript)
- [ ] `p1-3` Scaffold Vite + React app (TypeScript)
- [ ] `p1-4` Set up PostgreSQL database

---

## Phase 2 — Database Schema
Define and migrate the full data model before building any features.

- [ ] `p2-1` Users table (id, email, name, created_at)
- [ ] `p2-2` Sessions table (Better Auth managed)
- [ ] `p2-3` Accounts table (id, user_id, name, created_at)
- [ ] `p2-4` Categories table (fixed top-level + user-defined subcategories)
- [ ] `p2-5` Transactions table (id, user_id, account_id, category_id, subcategory_id, description, amount, operation_type, date, status, deleted_at)
- [ ] `p2-6` Email whitelist table (id, user_id, email)
- [ ] `p2-7` Run initial migration and seed fixed categories

---

## Phase 3 — Authentication
Users can register, log in, and log out using database sessions.

- [ ] `p3-1` Install and configure Better Auth with Express adapter
- [ ] `p3-2` Wire session middleware into Express
- [ ] `p3-3` Expose auth routes (`/api/auth/**`)
- [ ] `p3-4` Build Register page (form + API call)
- [ ] `p3-5` Build Login page (form + API call)
- [ ] `p3-6` Implement logout button
- [ ] `p3-7` Add protected route wrapper in React (redirect to login if no session)
- [ ] `p3-8` Add auth guard middleware on Express routes

---

## Phase 4 — Transactions (Manual Entry)
Core CRUD for the financial ledger.

- [ ] `p4-1` GET `/api/transactions` — list with filters (date range, category, type) and sorting
- [ ] `p4-2` POST `/api/transactions` — create transaction
- [ ] `p4-3` PATCH `/api/transactions/:id` — edit transaction
- [ ] `p4-4` DELETE `/api/transactions/:id` — soft delete
- [ ] `p4-5` GET `/api/accounts` + POST (manage user accounts)
- [ ] `p4-6` GET `/api/categories` + POST subcategory (user-defined subcategories)
- [ ] `p4-7` Build "Log Entry" form (description, amount, type, category, subcategory, account, date)
- [ ] `p4-8` Build transaction list with filter/sort controls
- [ ] `p4-9` Build edit/delete actions on transaction rows

---

## Phase 5 — Dashboard
Visual overview of the user's financial data.

- [ ] `p5-1` GET `/api/dashboard/summary` — monthly income, expense, net
- [ ] `p5-2` GET `/api/dashboard/category-breakdown` — totals per category for a period
- [ ] `p5-3` GET `/api/dashboard/trend` — weekly/monthly spending or net cash flow
- [ ] `p5-4` Build monthly summary cards (income / expense / net)
- [ ] `p5-5` Build category breakdown pie/bar chart (Recharts)
- [ ] `p5-6` Build trend line chart (Recharts)
- [ ] `p5-7` Add period selector (current month, last 3 months, custom range)

---

## Phase 6 — Budgets
Per-category budget limits with progress tracking.

- [ ] `p6-1` Budgets table (id, user_id, category_id, amount, period)
- [ ] `p6-2` POST/PATCH/DELETE `/api/budgets`
- [ ] `p6-3` GET `/api/budgets` — with current spend vs limit for the active period
- [ ] `p6-4` Build budget list + progress bar UI
- [ ] `p6-5` Budget form (set/edit limit per category)

---

## Phase 7 — Email Ingestion (AI Agent)
Receive emails via SendGrid, extract transaction data with AI, stage or commit.

- [ ] `p7-1` Register SendGrid Inbound Parse webhook → POST `/api/webhooks/email`
- [ ] `p7-2` Parse raw inbound email payload (sender, subject, body)
- [ ] `p7-3` Sender whitelist check (reject if not whitelisted)
- [ ] `p7-4` Integrate Vercel AI SDK + GPT-4o with Zod schema for extraction
- [ ] `p7-5` Confidence logic: commit directly if all fields extracted, else stage as pending
- [ ] `p7-6` GET `/api/transactions/pending` — list staged transactions
- [ ] `p7-7` POST `/api/transactions/pending/:id/confirm` — confirm and commit
- [ ] `p7-8` PATCH `/api/transactions/pending/:id` — edit before confirming
- [ ] `p7-9` DELETE `/api/transactions/pending/:id` — discard
- [ ] `p7-10` Build review queue UI (list pending, confirm/edit/discard actions)

---

## Phase 8 — Email Whitelist Management
Let users control which sender addresses can submit via email.

- [ ] `p8-1` GET `/api/whitelist` — list user's whitelisted senders
- [ ] `p8-2` POST `/api/whitelist` — add sender
- [ ] `p8-3` DELETE `/api/whitelist/:id` — remove sender
- [ ] `p8-4` Build whitelist management UI (settings page)

---

## Phase 9 — Deployment
Ship to production.

- [ ] `p9-1` Provision PostgreSQL on Railway/Render
- [ ] `p9-2` Deploy Express backend (Railway/Render), configure env vars
- [ ] `p9-3` Deploy frontend to Vercel, configure `VITE_API_URL`
- [ ] `p9-4` Point SendGrid Inbound Parse webhook to production URL
- [ ] `p9-5` Run production smoke test (register, log transaction, email ingestion)
