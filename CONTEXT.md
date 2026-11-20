# Project Context
Last updated: 2026-11-20

## What this is
Personal brand site for Bodo Desderio, live at **https://bododesderio.com**. It is
a single-tenant CMS, not a static portfolio: copy, SEO, navigation, theming,
images, banners and SMTP credentials are runtime-editable database rows managed
through `/admin`.

## Stack
- Next.js 16 (App Router, standalone output) · TypeScript strict · Tailwind 3
- PostgreSQL 16 + Prisma 5, self-hosted in Docker in dev and prod
- NextAuth v5 beta: single admin, bcrypt-12, JWT sessions
- Redis (rate limiting) · Nodemailer → Brevo SMTP relay · React Email · CKEditor 5 · sharp
- Uploads on local disk (`public/uploads`) via a Docker volume

## Architecture
```
app/(public)/*  RSC → Prisma directly (no API layer)
app/(admin)/*   client components → fetch /api/admin/* → router.refresh()
app/api/*       admin routes (auth-guarded), public routes, Brevo webhooks
lib/data/       db, content, profile, site-analytics, cache tags
lib/domain/     mailer, senders, email-tracking, brevo-webhook, inbound-email,
                image-alpha, analytics-range, maintenance, audit, notifications …
lib/seo/        page-metadata (every page's title/description/OG/canonical)
lib/emails/     React Email templates + brand (logo, social links)
lib/util/       sanitize, rate-limit, link-signing, csv, with-admin …
```
`app/` stays as-is: in the App Router the directory tree is the URL structure.

## The only command
```bash
docker compose up -d --build
```
Migrations run on boot; seeding only on an empty DB. Production uses
`compose.vps.yaml` behind the shared Traefik edge; see `docs/DEPLOY.md`.

## How the main features work
- **Home hero**: portrait plus the active rows in Content > Home > hero images,
  cross-faded every 3.5 s (`HeroSlides`). Cut-outs (images with transparency,
  detected by `image-alpha.ts`) show whole; photos are cropped and faded in with
  a curved mask. Light/dark/auto theme drives the `--band-*` tokens.
- **Images**: every public image opens in one viewer (`Lightbox.tsx`, mounted in
  the public layout) with previous/next, keyboard and swipe; `Zoomable` wraps an
  image, rich-text images are picked up automatically.
- **SEO**: `pageMetadata()` reads Settings > SEO first, then page defaults; always
  emits a share image (generated `/opengraph-image` fallback), canonical and card.
- **Email**: senders per purpose (`news@`, `work@`, `no-reply@`); Brevo webhook
  `/api/webhooks/brevo` records delivery/bounce/spam/unsubscribe once per message
  and stops newsletters to suppressed addresses; inbound mail to any
  @bododesderio.com address arrives at `/api/webhooks/brevo-inbound`, is stored
  in `inbound_emails` and forwarded to `INBOUND_FORWARD_TO`.
- **Admin Overview** (`/admin`): quick actions, counts, site analytics and recent
  activity on one page; `/admin/analytics` redirects there.

## Recent decisions
- **2026-11-20 — Brevo for all email, Postal removed.** Postal was never
  deployed. Brevo matches the other Rooibok projects (rooibok.tech uses the same
  inbound-parsing setup). Webhooks are registered by
  `scripts/register-brevo-webhooks.mjs` from the VPS (API keys are IP-restricted).
- **2026-11-20 — Inbound mail forwarded inline, retried by Brevo.** No worker
  queue here, so the webhook forwards synchronously and returns 500 on failure;
  Brevo redelivers and stored rows are reused, so nothing is sent twice.
- **2026-11-20 — Admin SEO settings now drive metadata.** They were stored but
  never read; page-level `openGraph` also dropped the share image on 9 of 10 pages.
  The stale seeded SEO rows (which said Kampala) were rewritten.
- **2026-11-20 — Header hides on scroll for pointer users.** Tapping a link left
  focus in the header and pinned it; only keyboard users keep it pinned now.
- **2026-11-20 — Email brand is module state, not React context.** Templates are
  imported by server routes, where `createContext` breaks the build.
- **2026-11-20 — `instrumentation.ts` imports inside the `NEXT_RUNTIME` check.**
  An early return left the Prisma/ioredis chain in the Edge bundle and broke
  `next build`.
- **2026-09-04 — Apex domain `bododesderio.com`**, compose project `myportfolio`
  in `/opt/myportfolio`, fresh DB.
- **2026-07-21 — Single branch, no CI.** The GitHub account is billing-locked,
  so checks run locally before push.
- **2026-07-20 — Migration history is the source of truth.** `prisma db push` is
  banned.

## Known issues
- 20 public pages are `force-dynamic`; content reads are `unstable_cache`d.
- Backups are manual (pre-deploy dumps in `/opt/myportfolio/backups`).
- `compose.yaml` holds a dev admin hash and personal email as dev defaults; both
  are already in git history.
- The seed's `about.story.items` are older sample entries; production content
  was corrected in place and is the source of truth.
- Timeline entries for Rooibok, YOUNGO and ALX have no dates yet ("Present" /
  "Alumnus"); the owner can add them in Content > About > story.
- The Brevo SMTP and API keys were shared in a chat transcript; rotate them in
  Brevo if that matters.

## Next steps
1. Owner picks hero images (Content > Home > hero images); cut-outs look best.
2. Owner confirms whether the "Community Platform" project is real.
3. Add dates to the Rooibok, YOUNGO and ALX timeline entries.
4. Submit the sitemap in Google Search Console and watch coverage.

## Re-running a local check
Scratch Postgres on port 16432 (`postgres:16-alpine`), `prisma migrate deploy`,
`prisma db seed`, then `next dev -p 16001` (ports stay in the 16000 block).
`rm -rf .next` before switching between `next dev` and `next build`.
