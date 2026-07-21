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
- **2026-07-21 — Single-branch repo; no CI.** The hardening branch merged to
  `main` (PR #1, `ffb3ec1`) and was deleted. GitHub Actions was removed entirely
  (`c6fcaf3`): every run failed at startup — the account is locked over a billing
  issue, which halts Actions even on public repos. Workflow is now edit → commit
  → `git push origin main`; checks run locally before push.
- **2026-07-21 — `isomorphic-dompurify` kept server-external.** It pulls in
  `jsdom`, whose runtime asset load webpack-bundling breaks, failing the prod
  build. `serverExternalPackages` in `next.config.js` fixes it; Docker builder
  pins `NODE_ENV=production` so a polluted env can't bundle React's dev runtime.
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
- **`POSTAL_WEBHOOK_SECRET` is unset in prod**, so the webhook rejects everything
  and delivery/bounce events are silently not recorded. Email stats undercount.
  Set it during the next deploy (`docs/DEPLOY.md`).
- **CSP still allows `unsafe-inline`.** The sanitizer now carries the XSS risk;
  moving to a nonce-based CSP is deferred (§ "Refactor pass" #6 — the one item
  left; high risk, own PR).
- **20 public pages remain `force-dynamic`.** Content/settings/SEO reads are now
  `unstable_cache`d, but the pages themselves aren't statically rendered.
- **No CI — intentional.** The GitHub account is billing-locked, so Actions can't
  run. Verify locally before push: `pnpm typecheck && pnpm lint && pnpm test &&
  pnpm build` (build needs `env -u NODE_ENV` + a scratch DB).
- **Backups are manual** (`pnpm db:backup`) — no cron on the server.
- `compose.yaml` contains a hardcoded `ADMIN_PASSWORD_HASH` and a personal email
  as dev defaults; both are already in git history.

## Session summary (2026-07-21) — hardening + refactors + live audit shipped

The audit-remediation work, five of the six deferred refactors, AND a live
Playwright audit (with four bug fixes) are **merged to `main`**. Repo is
single-branch; deploy runbook is `docs/DEPLOY.md`. Only the nonce-CSP hardening
is left, on purpose. Nothing is in flight.

### Live audit (2026-07-21) — ran the app end-to-end via Playwright, twice
Isolated scratch stack (Postgres+Redis on ports 55444/63977, seeded with a known
admin password hash so login is controllable), `next dev` on :3011. Verified live
**and re-confirmed on a second pass**: all public pages; contact form + newsletter
subscribe (persisted, visible in dashboard); login (wrong+right); Services CRUD
(201/200/200); Banners create/toggle/duplicate + preview modal; media upload
(file on disk); SMTP config save; CKEditor mounts; every admin page loads.

Four bugs found and **fixed + verified live** (all on `main`):
1. **CKEditor was fully broken** (`1ee137a`) — ckeditor5 v48 throws
   `license-key-missing` with no `licenseKey`. Added `licenseKey: 'GPL'`.
2. **Sidebar missing after login** (`ec063be`) — `admin/layout.tsx` gates the
   shell on session; `router.push` reused the login page's stale no-session
   layout. Fixed with a full-nav redirect (`window.location.assign`).
3. **Hydration mismatch + double file-chooser** (`1b1f4bc`) — AxiomUI's script
   (`public/js/axiom-ui.js`, mounted in root layout) replaced React-managed
   `<select>`/`<input type=file>`/`<input type=color>` on admin pages. Now skips
   `/admin` in `upgradeAll()`.
4. **CSP blocked external images** (`710769d`) — `img-src` broadened to `https:`.

Setup gotcha: a stale webpack `.next` makes `next dev` (Turbopack) 404 every
route-group page — `rm -rf .next` before `next dev`.

**Production build verified (exit 0, 57/57 static pages).** The `unstable_cache`
change compiles clean. Verifying surfaced two build-only issues, both fixed in
`c9db5da`:
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
- CI workflow (typecheck/lint/test/build + drift guard) — later removed because
  the GitHub account is billing-locked; checks now run locally before push
- EmbedSection no longer imports Prisma; blog image `alt` now uses post title

### Refactor pass (2026-07-21) — shipped, one item left
The §5 pure-churn refactors, done as their own reviewable commits (all verified
by typecheck + lint + 159 tests + a clean production build):
1. ✅ `withAdmin` wrapper (`lib/util/with-admin.ts`) — 23 CRUD route files. Auth
   guard can no longer be forgotten. Hardened routes (content/seo/settings/
   config), uploads, newsletter, auth, analytics keep inline guards on purpose.
2. ✅ `useResourceCrud` (`components/admin/useResourceCrud.ts`) — adopted in
   Clients + Services (full), Testimonials + Press (partial). HeroImages/Embed
   left inline: they drive lists off local optimistic state, not router.refresh.
3. ✅ `BannersManager` split → orchestrator + banner-types + BannerForm /
   BannerList / BannerPreviewModal (782 → 155-line orchestrator).
4. ✅ `lib/motion.ts` (EASE + fadeUp/fadeIn) + `components/ui/SectionHeader.tsx`
   (adopted in the 3 exact-match slate sections).
5. ✅ Loading skeletons — `components/ui/Skeleton.tsx` + `loading.tsx` for the
   public and admin route groups (there were none).
6. ⏳ CSP `unsafe-inline` → nonce-based — DEFERRED (not pure churn). Needs
   middleware-issued per-request nonces threaded to next-themes' pre-paint script
   and the ~8 inline JSON-LD SEO scripts; high risk on the live site (theme
   flash / broken hydration / dropped structured data). The XSS hole is already
   closed by the DOMPurify sanitizer, so this is hardening, not a fix. Do it as
   its own staging-tested PR.

## Next steps
1. On prod, once: `prisma migrate resolve --applied 20260720000000_baseline_sync_drifted_models`
   — the tables already exist there; without this the next deploy errors. See
   `docs/DEPLOY.md`.
2. Set `POSTAL_WEBHOOK_SECRET` to restore email tracking.
3. The deferred pure-churn refactors (§ "Not started" above) as their own pass.
4. ADR-001 phases 1–3 once the domain is acquired.

Merged to `main`: DOMPurify sanitizer, resumable newsletter, `unstable_cache` on
content/settings/SEO, build fixes — all verified by a clean production build.

**No CI.** GitHub Actions is removed because the account is billing-locked, so
every run failed at startup. Run checks locally before pushing:
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Drift guard:
`pnpm prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script`
should be empty.

## Active branches
- `main`: stable, single-branch repo. Head `c6b4b5c`. All work merged here.
