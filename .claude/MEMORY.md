# Project Memory
Created: 2026-07-20

## [2026-07-20] — Audit, migration-drift repair, unauth security fixes, lib restructure

- **Decisions:**
  - Migration history is the single source of truth. `prisma db push` is banned
    in every environment; both container start scripts use `migrate deploy`.
  - Self-hosted Postgres only. Supabase dropped (it was two README lines).
  - `docker compose up -d --build` is the one command everywhere; `COMPOSE_FILE`
    in `.env` selects dev vs prod. Seeding is idempotent (`seed-if-empty.sh`).
  - Click-tracking URLs are HMAC-signed with a purpose-scoped key.
  - `lib/` layered into `data/` `domain/` `util/`; `app/` left alone because in
    App Router the directory tree is the URL structure.
  - Subdomains will be host-routed into one Next.js app, not split into
    services. Admin cookie scoped to `admin.` host only, never parent domain.

- **Patterns:**
  - Verify agent findings before relaying. Two reported numbers were wrong
    (admin-route boilerplate 27%→13%, `'use client'` 86%→57%); auth coverage had
    been measured per-file, which would miss a file guarding GET but not DELETE.
    Re-measured per-handler: 62/62 genuinely guarded.
  - Test sanitizers by *executing* their regexes, not reading them.
  - Restructure recipe that worked: normalise intra-package relative imports to
    path aliases first, then move files, then rewrite aliases globally. `tsc`
    catches every miss. Relative imports in `__tests__` are the easy thing to
    forget.

- **Gotchas:**
  - `prisma migrate diff` writes its "update available" banner into stdout —
    redirecting `2>&1` glues an ASCII box into the SQL and the migration fails
    with a syntax error. Use `2>/dev/null`.
  - Generated `ADD COLUMN ... NOT NULL` with no default fails on tables holding
    rows. Add with a default, then `DROP DEFAULT` in the same migration to keep
    the schema matching Prisma exactly.
  - `git mv` aborts the whole batch if any source is untracked.
  - Dockerfile copied only `docker-start.sh`; adding a second script it sources
    would have killed the container on boot under `set -e`. Copy `scripts/`.
  - Drift was worse than first measured: 4 missing tables **plus** 5 drifted
    `ALTER`s. Always diff, never trust a model-vs-table count.

- **Operational debt surfaced:** `POSTAL_WEBHOOK_SECRET` unset → webhook rejects
  everything → delivery/bounce events silently unrecorded, email stats undercount.
