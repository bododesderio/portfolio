# Project Context
Last updated: 2026-07-21

## What this is
Personal brand site for Bodo Desderio — **not** a static portfolio. A
single-tenant CMS: copy, SEO, navigation, theming, banners and SMTP credentials
are all runtime-editable database rows, managed through `/admin`.

## Stack
- Next.js 16 (App Router, standalone output) · TypeScript strict · Tailwind 3
- PostgreSQL 16 + Prisma 5 — **self-hosted in Docker**, dev and prod alike
- NextAuth v5 beta — single admin, bcrypt-12, JWT sessions (8h / 30d "remember me")
- Redis (rate limiting) · Nodemailer → self-hosted Postal · CKEditor 5 · sharp
- Uploads on local disk (`public/uploads`) via a Docker volume

## Architecture
```
app/(public)/*  RSC → Prisma directly (no API layer). 20 pages force-dynamic.
app/(admin)/*   client components → fetch /api/admin/* → router.refresh()
app/api/*       53 routes: 41 admin (all auth-guarded) + 12 public
lib/data/       db, content, analytics
lib/domain/     banners, embed, email-tracking, mailer, notifications,
                media-uploads, medium, unsubscribe, confirm-subscribe
lib/util/       sanitize, image-utils, local-storage, rate-limit,
                link-signing, theme
lib/            auth.ts, config.ts, schema.ts, emails/
```
`app/` is deliberately NOT restructured — in App Router the directory tree is
the URL structure, so `app/api` and `app/(admin)` already are the backend and
admin boundaries.

## The only command
```bash
docker compose up -d --build
```
Builds, generates the Prisma client, applies migrations, seeds only if the DB is
empty, starts the app. `COMPOSE_FILE=compose.prod.yaml` in `.env` selects the
production stack; unset selects dev. Same command on both.

## Recent decisions
- **2026-07-20 — Migration history is the source of truth.** `prisma db push` is
  banned. It had produced 4 tables + 5 column sets present in the running DB but
  in no migration file, so a from-source deploy built a broken schema. Both
  start scripts now use `migrate deploy`; schema changes go through
  `prisma migrate dev --name ...` and get committed.
- **2026-07-20 — Dropped Supabase for self-hosted Postgres.** It was only
  referenced in two README lines; the containerised DB is now the only path.
- **2026-07-20 — Click-tracking destinations are HMAC-signed.** The tracker took
  an unvalidated `?url=`, and a valid EmailLog id is self-serve by subscribing —
  an open redirect on the apex domain. Signed with a distinct purpose string so
  a signature can never be replayed as a session token.
- **2026-07-20 — `lib/` layered into data/domain/util** rather than a flat
  drawer. `auth.ts`/`config.ts`/`schema.ts` stay at root as widely-imported
  integration points.
- **2026-07-20 — Subdomain split will be host routing into one app**, not
  separate services. See `.claude/adrs/ADR-001-subdomain-architecture.md`.

## Known issues
- **`POSTAL_WEBHOOK_SECRET` is unset**, so the webhook rejects everything and
  delivery/bounce events are silently not recorded. Email stats undercount.
- **Newsletter send is synchronous and marks `status:'sent'` before sending**
  (`app/api/admin/newsletter/send/route.ts:30`). A timeout mid-send plus a retry
  after the 60s window double-sends to everyone. Also re-renders the template
  once per subscriber.
- **`lib/util/sanitize.ts` is a bypassable regex sanitizer** — `<img/onerror=>`
  and `<svg/onload=>` pass through, and CSP allows `unsafe-inline`. Bounded:
  only the authenticated admin writes that HTML. Replace with DOMPurify.
- **20 public pages are `force-dynamic`** with no caching; the homepage fires 14
  Prisma queries per request. `lib/data/content.ts` has no cache at all.
- **No CI.** Clean typecheck and 130 passing tests that nothing enforces.
- **Backups are manual** (`pnpm db:backup`) — no cron on the server.
- `compose.yaml` contains a hardcoded `ADMIN_PASSWORD_HASH` and a personal email
  as dev defaults; both are already in git history.
- Missing indexes: `gallery_items(featured, category)`, `hero_images(active, order)`,
  `newsletter_campaigns(status)`, `blog_posts(category)`.
- `components/sections/EmbedSection.tsx` imports Prisma directly — the one
  layering violation left in `components/`.

## RESUME HERE (paused 2026-07-20, mid-audit-remediation)

Branch: `chore/deploy-hardening-and-structure`.

**Production build now verified (2026-07-21, exit 0, 57/57 static pages).** The
`unstable_cache` change compiles clean. Verifying surfaced two build-only issues,
both fixed in `c9db5da`:
- The `isomorphic-dompurify` sanitizer pulls in `jsdom`; webpack-bundling it
  broke jsdom's runtime asset load (`browser/default-stylesheet.css`) and failed
  page-data collection on every route importing the sanitizer. Fixed with
  `serverExternalPackages: ['isomorphic-dompurify', 'jsdom']` in `next.config.js`.
  This would also have turned CI red.
- Building with `NODE_ENV=development` (leaks from the dev shell profile) makes
  Next bundle React's dev runtime → prerender crashes with a `useContext` null
  error. Docker's builder stage now pins `ENV NODE_ENV=production`. Locally,
  build with `env -u NODE_ENV`.

Repro (scratch Postgres, then migrate + build):
```bash
docker run -d --name bodo_migrate_tmp -e POSTGRES_PASSWORD=tmp \
  -e POSTGRES_USER=tmp -e POSTGRES_DB=freshdb -p 55432:5432 postgres:16-alpine
DATABASE_URL="postgresql://tmp:tmp@localhost:55432/freshdb" npx prisma migrate deploy
env -u NODE_ENV DATABASE_URL="postgresql://tmp:tmp@localhost:55432/freshdb" \
  NEXTAUTH_SECRET="build-dummy" NEXT_PUBLIC_SITE_URL="http://localhost:3001" \
  ANALYTICS_SALT="build-dummy" npx next build --webpack
```

### Done in the remediation pass
- Sanitizer → isomorphic-dompurify (all known bypasses tested and closed)
- SSRF-safe fetch for link-check; rate-limit fail-closed on mail routes;
  per-target subscribe limit; banner/tracking endpoints limited; XFF read from
  the trusted end; HKDF per-purpose token keys + confirm-token TTL with legacy
  acceptance; ANALYTICS_SALT no longer degrades silently
- Newsletter made resumable using EmailLog as the progress ledger (no schema
  change), status now `sending` → `sent`, template rendered once not per
  subscriber
- Missing indexes migration `20260720010000_add_missing_query_indexes` (verified
  zero drift from a fresh DB)
- `unstable_cache` on content/settings/SEO reads with tag invalidation wired
  into all four admin writers — **note:** the settings single-key branch was
  missing invalidation and was fixed; zod validation added to that route
- CI workflow incl. a job that fails the build on schema/migration drift
- EmbedSection no longer imports Prisma; blog image `alt` now uses post title

### Not started — deliberately deferred
The pure-churn refactors from §5 of the audit, ~1,180 lines with no behaviour
change. Best done as their own pass so they can be reviewed without security
changes mixed in:
1. `withAdmin(schema, handler)` wrapper — ~200 lines of boilerplate across 62
   handlers; the real win is making it impossible to forget an auth guard
2. `useResourceCrud<T>` hook — 7 near-identical admin managers, ~35-45% scaffold
3. `BannersManager.tsx` split (782 lines → BannerForm / BannerList / PreviewModal)
4. `SectionHeader` + `lib/motion.ts` presets — ~25 repetitions
5. `loading.tsx` / Suspense / skeletons (none exist anywhere)
6. CSP `unsafe-inline` → nonce-based (high effort; sanitizer now carries the risk)

## Next steps
1. Open the PR for `chore/deploy-hardening-and-structure` → `main`; let CI
   (typecheck + lint + tests + build + migration-drift) prove it green.
2. On prod, once: `prisma migrate resolve --applied 20260720000000_baseline_sync_drifted_models`
   — the tables already exist there; without this the next deploy errors.
3. Set `POSTAL_WEBHOOK_SECRET` to restore email tracking.
4. The deferred pure-churn refactors (§ "Not started" above) as their own pass.
5. ADR-001 phases 1–3 once the domain is acquired.

Shipped this branch: DOMPurify sanitizer, resumable newsletter, CI (typecheck +
tests + build + drift), `unstable_cache` on content/settings/SEO — all verified
by a clean production build.

## Active branches
- `main`: stable
- `chore/deploy-hardening-and-structure`: this session's work
