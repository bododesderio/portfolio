#!/bin/sh
set -e

# Everything the app needs is done here, so that a single
#   docker compose up -d --build
# is the only command required — locally and in production alike.

echo "⏳ Prisma generate..."
pnpm prisma generate

# NOTE: this deliberately uses `migrate deploy`, NOT `db push`.
#
# `db push` applies schema changes without recording a migration. That is how
# this project ended up with 4 tables and 5 column sets present in the dev
# database but in no migration file — meaning a deploy from source produced a
# broken database. Using `migrate deploy` in dev too keeps migration history as
# the single source of truth, so that drift cannot silently reappear.
#
# To change the schema: edit prisma/schema.prisma, then run
#   pnpm prisma migrate dev --name describe_your_change
# which writes the migration file. Commit it.
echo "⏳ Applying migrations..."
pnpm prisma migrate deploy

sh scripts/seed-if-empty.sh

echo "🚀 Starting dev server..."
exec pnpm dev
