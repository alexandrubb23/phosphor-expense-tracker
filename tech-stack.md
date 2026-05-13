# Tech Stack — Personal Expense Tracker

## Frontend
- **Vite + React** — fast dev server and build tool, React for the UI
- **Tailwind CSS + shadcn/ui** — utility-first styling with composable components
- **Recharts** — dashboard charts (category breakdown, trend, budget progress)
- **React Query (TanStack Query)** — server state management and data fetching

## Backend
- **Node.js + Express** — REST API, SendGrid webhook endpoint
- **Prisma ORM** — type-safe database access and migrations

## Database
- **PostgreSQL** — relational DB for the financial ledger (transactions, accounts, categories, users, sessions)

## Authentication
- **Better Auth** (Express adapter) — session-based auth with database-persisted sessions (no JWTs)

## AI Extraction
- **Vercel AI SDK + OpenAI GPT-4o** — structured extraction of transaction fields from email body using Zod schemas; drives the confident vs. pending staging logic

## Email Ingestion
- **SendGrid Inbound Parse** — inbound emails forwarded to an Express webhook route

## Deployment
- **Vercel** (frontend) + **Railway / Render** (Express backend + PostgreSQL)
