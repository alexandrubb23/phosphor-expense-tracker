#!/bin/sh
set -e

echo "[entrypoint] Running database migrations..."
cd /app/backend
bunx prisma migrate deploy
cd /app

echo "[entrypoint] Starting application..."
exec "$@"
