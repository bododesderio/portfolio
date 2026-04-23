#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss

echo "Seeding database (if needed)..."
npx prisma db seed 2>/dev/null || true

echo "Starting server..."
exec node server.js
