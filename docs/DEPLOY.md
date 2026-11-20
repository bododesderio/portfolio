# Production Deploy Runbook

Production is **https://bododesderio.com** on the shared Hostinger VPS
(`195.110.59.36`), compose project `myportfolio` in `/opt/myportfolio`. A shared
Traefik edge (`/opt/infra/traefik`) owns ports 80/443 and the Let's Encrypt
certificates; `compose.vps.yaml` puts the app on the external `web` network with
Traefik labels and keeps Postgres and Redis on a private network with no host
ports.

The container entrypoint (`scripts/docker-start.sh`) runs `prisma migrate deploy`
on every boot, seeds only an empty database, then starts the server.

---

## Routine deploy

```bash
ssh root@195.110.59.36
cd /opt/myportfolio

# 1. Back up first whenever the release has a migration or data change.
mkdir -p backups
docker exec bodo_db_prod sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql.gz"

# 2. Pull and rebuild.
git pull --ff-only origin main
docker compose -f compose.vps.yaml up -d --build

# 3. Verify.
docker compose -f compose.vps.yaml ps            # app, db, redis all healthy
docker logs bodo_app_prod 2>&1 | grep -E "migrat|seed"
curl -fsS https://bododesderio.com/api/health
```

There is no CI. Before pushing, run locally:

```bash
pnpm typecheck && pnpm lint && pnpm test
env -u NODE_ENV pnpm build      # needs a scratch DATABASE_URL
```

Schema changes go through `pnpm prisma migrate dev --name <change>` and are
committed; `prisma db push` is banned.

---

## Email (Brevo)

Everything lives in the server's `.env` (mode `0600`):

| Variable | Value |
|---|---|
| `SMTP_HOST` / `SMTP_PORT` | `smtp-relay.brevo.com` / `587` |
| `SMTP_USER` / `SMTP_PASS` | Brevo SMTP login and SMTP key |
| `SMTP_FROM` | `Bodo Desderio <info@bododesderio.com>`; other senders derive from its domain |
| `EMAIL_WEBHOOK_SECRET` | `openssl rand -hex 32`; the token on both webhook URLs |
| `INBOUND_FORWARD_TO` | inbox that receives mail sent to any @bododesderio.com address |
| `BREVO_API_KEY` | attachment downloads for inbound mail, and webhook registration |

SMTP values can also be set in **Admin > Settings > Integrations** (stored
encrypted, they override `.env`); the **Send test email** button there sends a
tracked message to `ADMIN_EMAIL`, which should show as delivered in Email logs
within a minute.

**Senders** (`lib/domain/senders.ts`), all verified in Brevo:
`news@` newsletter, confirm, welcome and new-post mail; `work@` contact-form
replies; `no-reply@` admin mail and inbound forwards.

**DNS** (Hostinger): Brevo DKIM CNAMEs, DMARC, the `brevo-code` TXT, SPF
`v=spf1 include:spf.brevo.com ~all`, and MX `10 inbound1.sendinblue.com.` /
`20 inbound2.sendinblue.com.` for inbound parsing.

**Webhooks** (Brevo only accepts API calls from authorised IPs, so run on the VPS):

```bash
cd /opt/myportfolio && set -a && . ./.env && set +a
docker run --rm -e BREVO_API_KEY -e EMAIL_WEBHOOK_SECRET -e NEXT_PUBLIC_SITE_URL \
  -v "$PWD/scripts:/s:ro" node:22-alpine node /s/register-brevo-webhooks.mjs
```

It is idempotent: it registers the transactional webhook (`/api/webhooks/brevo`)
and the inbound one (`/api/webhooks/brevo-inbound`) only if they are missing.

---

## Rollback

```bash
git checkout <previous-commit>
docker compose -f compose.vps.yaml up -d --build

# Restore the database from a backup if the release changed data:
gunzip -c backups/pre-deploy-<timestamp>.sql.gz \
  | docker exec -i bodo_db_prod sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

## Notes

- Backups are manual; `backups/` on the VPS holds the pre-deploy dumps.
- `compose.prod.yaml` is the single-server variant without Traefik; production
  uses `compose.vps.yaml`.
