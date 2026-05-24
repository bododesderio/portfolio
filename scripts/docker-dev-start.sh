#!/bin/sh
set -e

echo "⏳ Running Prisma generate..."
pnpm prisma generate

echo "⏳ Pushing schema to database..."
pnpm prisma db push

if [ "${RUN_SEED_ON_START:-false}" = "true" ]; then
  echo "⏳ Seeding database..."
  pnpm db:seed
else
  echo "ℹ️  Skipping seed. Set RUN_SEED_ON_START=true to seed intentionally."
fi

echo "🚀 Starting dev server..."
exec pnpm dev
