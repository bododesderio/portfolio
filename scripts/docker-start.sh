#!/bin/sh
set -e

# Production container entrypoint. Everything the app needs to come up happens
# here, so `docker compose up -d --build` is the only command required.

echo "⏳ Applying migrations..."
npx prisma migrate deploy

sh scripts/seed-if-empty.sh

echo "🚀 Starting server..."
exec node server.js
