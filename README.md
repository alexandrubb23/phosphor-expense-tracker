# 💸 Phosphor — Personal Expense Tracker

> A full-stack personal finance app with AI-powered transaction ingestion via email.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.2-fbf0df?style=flat-square&logo=bun&logoColor=black)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-base--nova-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Better Auth](https://img.shields.io/badge/Better%20Auth-1.x-6D28D9?style=flat-square&logo=auth0&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI%20GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-6.x-000000?style=flat-square&logo=vercel&logoColor=white)
![SendGrid](https://img.shields.io/badge/SendGrid-Inbound%20Parse-1A82E2?style=flat-square&logo=twilio&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![TanStack Table](https://img.shields.io/badge/TanStack%20Table-8.x-FF4154?style=flat-square&logo=reactquery&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-7.x-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React%20Hook%20Form-7.x-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-4.x-3E67B1?style=flat-square&logo=zod&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3.x-22B5BF?style=flat-square&logo=chartdotjs&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.x-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/Testing%20Library-16.x-E33332?style=flat-square&logo=testinglibrary&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-10.x-362D59?style=flat-square&logo=sentry&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)

---

## Overview

Phosphor is a personal expense tracker built to explore AI-assisted application development. Users can manage their finances by logging transactions manually or by **sending an email** — an AI agent extracts structured data and either commits it directly to the ledger or stages it for review.

> Example: _"Spent 100 RON at Mega Image for food and drink."_
> → The AI extracts description, amount, operation type, category, and account automatically.

---

## Features

- 🔐 **Authentication** — session-based auth (no JWTs) via Better Auth
- 📊 **Dashboard** — monthly totals, category breakdown charts, trend charts, budget progress
- 📋 **Transaction ledger** — filterable and sortable table; manual or AI-ingested entries
- 🤖 **AI email ingestion** — SendGrid Inbound Parse + GPT-4o extracts transactions from plain-text emails
- 🔄 **Review queue** — low-confidence AI extractions are staged for user confirmation before hitting the ledger
- 📬 **Sender whitelist** — only approved email senders can submit transactions via email
- 🗂️ **Categories & subcategories** — fixed top-level categories with user-defined subcategories
- 🛡️ **Role-based access** — admin and user roles; admins never see other users' data
- 🌑 **Dark cyberpunk UI** — custom CSS variables, IBM Plex Mono/Sans fonts

---

## Architecture

```
alexb/                      ← Bun monorepo root
├── frontend/               ← React 19 SPA (Vite)
├── backend/                ← Express 5 REST API + AI webhook
└── core/                   ← Shared Zod schemas & enums (@expense-tracker/core)
```

| Layer       | Technology                                     |
|-------------|------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS v4, shadcn/ui     |
| State       | TanStack Query v5 (server state)               |
| Routing     | React Router v7                                |
| Forms       | React Hook Form + Zod                          |
| Charts      | Recharts                                       |
| Backend     | Express 5, Bun runtime                        |
| ORM         | Prisma 7 (PostgreSQL adapter)                  |
| Database    | PostgreSQL                                     |
| Auth        | Better Auth (session-based, Express adapter)   |
| AI          | Vercel AI SDK + OpenAI GPT-4o                  |
| Email       | SendGrid Inbound Parse webhook                 |
| Job queue   | pg-boss (PostgreSQL-backed)                    |
| Monitoring  | Sentry (frontend + backend)                    |
| Testing     | Vitest + RTL (unit) · Playwright (e2e)         |
| Containers  | Docker + docker-entrypoint.sh (migrate → run)  |
| Deployment  | Railway (backend + DB)                         |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.2
- [PostgreSQL](https://www.postgresql.org) running locally (or a connection URL)
- A SendGrid account (for email ingestion)
- An OpenAI API key (for AI extraction)

### Install

```bash
bun install
```

### Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Fill in the required values (database URL, SendGrid API key, OpenAI API key, Better Auth secrets).

### Database setup

```bash
cd backend
bunx prisma migrate deploy
```

### Run (development)

```bash
# From repo root — starts frontend + backend concurrently
bun run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3000

---

## Testing

```bash
# Unit / component tests (Vitest + RTL)
cd frontend && npm test

# End-to-end tests (Playwright)
bun run test:e2e

# E2e with UI
bun run test:e2e:ui
```

> E2e tests run against a separate `expense-tracker-test` database. The backend loads `.env.test` when `NODE_ENV=test`.

---

## Docker

```bash
# Build production image
docker build --target production -t phosphor .

# Run (requires DATABASE_URL and other env vars)
docker run -p 3000:3000 --env-file backend/.env phosphor
```

---

## Project Scope

See [`project-scope.md`](./project-scope.md) for the full feature specification and [`tech-stack.md`](./tech-stack.md) for a tech stack overview.
