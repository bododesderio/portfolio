# Production Deploy Runbook

Deploying `main` to the VPS. The stack is defined in `compose.prod.yaml`
(services `db` / `redis` / `app`; container `bodo_db_prod`), selected by
`COMPOSE_FILE=compose.prod.yaml` in `.env`.

The container entrypoint (`scripts/docker-start.sh`) runs `prisma migrate deploy`
automatically on **every** boot, then seeds only if the DB is empty, then starts
the server. So the steady-state deploy is a single command:

```bash
docker compose up -d --build
```

The full runbook below adds a backup, verification, and the one-time
drift-resolve step that the **first** deploy of the hardening branch requires.

---

## One-time prerequisite (first deploy only)

The prod database already contains the tables that migration
`20260720000000_baseline_sync_drifted_models` creates (historical `prisma db push`
drift). If the app boots and runs `migrate deploy` against that DB unprepared, the
migration hits `relation already exists` and — under `set -e` — crash-loops the
container.

So on the **first** deploy after this branch, mark that migration as *applied*
(records it without running its SQL) **before** the new app container boots. This
is covered in step 3 below and is a once-ever action.

---

## 0. SSH in and set the missing secret

```bash
ssh your-user@your-vps
cd /path/to/portfolio            # the repo dir on the VPS

# Set the Postal webhook secret (must match what's configured in Postal).
# Without it, delivery/bounce/open/click events are silently rejected.
#   POSTAL_WEBHOOK_SECRET="<the-secret-from-postal>"
nano .env
```

Confirm `.env` also has `COMPOSE_FILE=compose.prod.yaml` — that's what makes plain
`docker compose` target the prod stack.

## 1. Back up the database first

```bash
mkdir -p backups
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > "backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
ls -lh backups/ | tail -1        # verify the file is non-empty
```

## 2. Pull `main`

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git log --oneline -1
```

## 3. Build the image, then resolve the drifted migration (first deploy only)

Skip this whole step on routine deploys — it is only needed once.

```bash
# Build the new app image without starting it, and bring the DB up.
docker compose build app
docker compose up -d db redis

# Wait until Postgres reports healthy.
until [ "$(docker inspect -f '{{.State.Health.Status}}' bodo_db_prod)" = "healthy" ]; do
  echo "waiting for db..."; sleep 2
done

# Record the already-existing tables' migration as applied, using the freshly
# built image (which contains the new migration files) against the live DB.
docker compose run --rm --no-deps app \
  npx prisma migrate resolve --applied 20260720000000_baseline_sync_drifted_models
```

Re-running it later is harmless — it will report the migration is already recorded.

## 4. Deploy

```bash
docker compose up -d --build
```

On boot the entrypoint runs `migrate deploy` (skipping the resolved migration and
**applying** the new `20260720010000_add_missing_query_indexes`), skips seeding
(`RUN_SEED_ON_START` defaults to `false` in prod), and starts the server.

## 5. Verify

```bash
docker compose ps
docker compose logs -f app        # watch for "🚀 Starting server..."; Ctrl-C to exit

# Health endpoint (from the VPS):
curl -fsS http://127.0.0.1:${APP_PORT:-3000}/api/health && echo "  <- OK"
```

Then load the public site and log into `/admin` in a browser to confirm sessions
work.

---

## Routine deploys (after the first)

Once the drift is resolved, every subsequent deploy is just:

```bash
git pull --ff-only origin main
docker compose up -d --build
```

(Take a backup first — step 1 — whenever a deploy includes a migration.)

New schema changes must go through `prisma migrate dev --name <describe_change>`
locally and be committed; `prisma db push` is banned because it was the original
source of the drift. CI fails any PR whose `schema.prisma` diverges from the
migration history.

---

## Rollback

```bash
# Revert code to the previous release and rebuild:
git checkout <previous-commit>
docker compose up -d --build

# If the DB must be restored from the backup taken in step 1:
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < backups/pre-deploy-<timestamp>.sql
```

---

## Notes

- **nginx / SSL** (if run separately, see `infra/`): unaffected — the app serves
  on `APP_PORT` (default 3000); the reverse proxy config does not change.
- **Backups are currently manual.** Consider a cron entry on the VPS running the
  step-1 `pg_dump` on a schedule.
