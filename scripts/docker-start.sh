#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding database..."
  npx prisma db seed
else
  echo "Skipping seed. Set RUN_SEED_ON_START=true to seed intentionally."
fi

echo "Starting server..."
exec node server.js
