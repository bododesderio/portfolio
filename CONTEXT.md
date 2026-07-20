# Project Context
Last updated: 2026-07-20

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

## Next steps
1. On prod, once: `prisma migrate resolve --applied 20260720000000_baseline_sync_drifted_models`
   — the tables already exist there; without this the next deploy errors.
2. Set `POSTAL_WEBHOOK_SECRET` to restore email tracking.
3. Replace the regex sanitizer with `isomorphic-dompurify`.
4. Newsletter → resumable job with per-recipient rows.
5. GitHub Actions running typecheck + tests.
6. `unstable_cache` on `lib/data/content.ts`, invalidated by existing `revalidatePath` calls.
7. ADR-001 phases 1–3 once the domain is acquired.

## Active branches
- `main`: stable
- `chore/deploy-hardening-and-structure`: this session's work
