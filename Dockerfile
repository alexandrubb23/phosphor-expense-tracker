# syntax=docker/dockerfile:1

# ==============================================================
# Base — shared Bun image + workspace package manifests
# ==============================================================
FROM oven/bun:1.2.20-slim AS base
WORKDIR /app

# Copy package manifests first so dependency layers are cached
# independently of application source changes.
COPY package.json bun.lock ./
COPY core/package.json        ./core/
COPY frontend/package.json    ./frontend/
COPY backend/package.json     ./backend/

# ==============================================================
# Dev — full install + source; run with docker compose for local
# ==============================================================
FROM base AS dev

RUN bun install

COPY . .

EXPOSE 3000 5173
CMD ["bun", "run", "dev"]

# ==============================================================
# Stage — build frontend + generate Prisma client
# ==============================================================
FROM base AS stage

RUN bun install

COPY . .

# Build the Vite SPA (outputs to frontend/dist)
RUN cd frontend && bun run build

# Generate the Prisma client into backend/src/generated/prisma
RUN cd backend && bunx prisma generate

# ==============================================================
# Production — lean runtime image
# ==============================================================
FROM oven/bun:1.2.20-slim AS production
WORKDIR /app

ENV NODE_ENV=production

# OpenSSL is required by the Prisma migration engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# No bun.lock here — bun install --production resolves from package.json
# directly, avoiding a frozen-lockfile conflict between full and prod installs.
COPY package.json ./
COPY core/package.json     ./core/
COPY frontend/package.json ./frontend/
COPY backend/package.json  ./backend/

RUN bun install --production

# Built frontend assets (served by Express in production)
COPY --from=stage /app/frontend/dist ./frontend/dist

# Backend TypeScript source (Bun executes TS directly — no compile needed)
COPY backend/src            ./backend/src
COPY backend/tsconfig.json  ./backend/tsconfig.json
COPY backend/prisma         ./backend/prisma
COPY backend/prisma.config.ts ./backend/prisma.config.ts

# Pre-built Prisma client (avoids re-running prisma generate at startup)
COPY --from=stage /app/backend/src/generated ./backend/src/generated

# Core workspace source (imported directly as TS by both frontend & backend)
COPY core/src ./core/src

# Entrypoint: migrate DB then hand off to CMD
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "backend/src/index.ts"]
