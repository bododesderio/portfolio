#!/bin/sh
# Seed the database only when it has no content yet.
#
# This is what makes `docker compose up -d --build` sufficient on its own: a
# brand new volume gets seeded automatically, and every subsequent boot is a
# no-op. No separate seed command to remember, and no risk of a restart
# overwriting live content.
#
# RUN_SEED_ON_START:
#   auto  (default) — seed only when the database is empty
#   true            — always seed (destructive: re-runs upserts over live rows)
#   false           — never seed
set -e

MODE="${RUN_SEED_ON_START:-auto}"

if [ "$MODE" = "false" ]; then
  echo "ℹ️  Seeding disabled (RUN_SEED_ON_START=false)."
  exit 0
fi

if [ "$MODE" = "auto" ]; then
  # -1 means "could not determine" (e.g. client unavailable); treat as non-empty
  # so we never seed over a database we failed to inspect.
  ROWS=$(node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.siteContent.count()
      .then((c) => { console.log(c); return p.\$disconnect(); })
      .catch(() => { console.log(-1); })
      .finally(() => process.exit(0));
  " 2>/dev/null | tail -1)

  case "$ROWS" in
    0)
      echo "🌱 Database is empty — seeding initial content..."
      ;;
    -1|'')
      echo "⚠️  Could not determine database state; skipping seed to be safe."
      exit 0
      ;;
    *)
      echo "ℹ️  Database already has ${ROWS} content rows — skipping seed."
      exit 0
      ;;
  esac
else
  echo "🌱 RUN_SEED_ON_START=true — seeding (this overwrites seeded content)..."
fi

# A failed seed must not stop the app from booting: the schema is already
# migrated and an operator can seed manually. Fail loudly, carry on.
if npx prisma db seed; then
  echo "✅ Seed complete."
else
  echo "⚠️  Seed failed — continuing startup. Run 'pnpm db:seed' manually to retry."
fi
