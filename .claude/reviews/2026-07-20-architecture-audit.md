# Portfolio — Architecture, Security & Refactoring Audit
**Date:** 2026-07-20
**Scope:** Full codebase (349 tracked files, Next.js 16 + Prisma + NextAuth v5)
**Baseline verified:** `tsc --noEmit` clean · `vitest run` 120/120 passing
**Status:** Report only — no source files were modified.

---

## 0. Executive summary

The codebase is **better engineered than its commit history suggests**. Auth is genuinely solid, upload validation exceeds most production apps, and there is no SQL injection despite `$queryRawUnsafe` usage. The problems are not sloppiness — they are the predictable consequences of a solo project that grew past the point where "push the schema and redeploy" still works.

Three things need attention before this scales:

1. **The project cannot be redeployed from source.** Migration history is missing 4 of 23 models. Severity: blocking.
2. **Two unauthenticated attack paths** are reachable with curl and a throwaway email: an open redirect and a rate limiter keyed on attacker-controlled input.
3. **The newsletter send path can double-send to your entire list** after a timeout.

Everything else is quality-of-life.

---

## 1. How the architecture actually works

Single-tenant, database-driven CMS. Not a static portfolio — nearly all copy, SEO, navigation, theming, and even SMTP credentials are runtime-editable rows.

```
Request
  │
  ├─ /(public)/*  ── React Server Components ──► Prisma ──► Postgres
  │                  (no API layer; 20 pages force-dynamic)
  │
  ├─ /(admin)/*   ── Client components ──fetch──► /api/admin/* ──► Prisma
  │                  (mutate → router.refresh() / revalidatePath())
  │
  └─ /api/*       ── 53 routes: 41 admin (auth-guarded) + 12 public
                     │
                     ├─ lib/auth.ts        NextAuth v5, bcrypt-12, JWT 8h/30d
                     ├─ lib/config.ts      AES-256-GCM secrets, 5-min TTL cache
                     ├─ lib/rate-limit.ts  Redis sliding window (fails open)
                     ├─ lib/email-*.ts     Nodemailer → self-hosted Postal
                     └─ lib/media-uploads  MIME + magic bytes → sharp → WebP
```

**Deliberate choices that are correct and should not be changed:**

- Server components calling Prisma directly. For a read-heavy single-tenant site, an intermediate REST layer would be pure overhead.
- No React Query. Content is near-static; `router.refresh()` is the right amount of machinery.
- Secrets in an encrypted DB table rather than env-only — enables runtime SMTP reconfiguration without redeploy.
- Defence in depth on auth: middleware *and* per-handler checks.

---

## 2. Verified strengths

Measured, not assumed:

| Area | Finding |
|---|---|
| Admin authorization | **62/62 handlers** call `auth()` — verified per-handler, not per-file |
| SQL injection | **None.** `lib/analytics.ts:36,69,109` use `$queryRawUnsafe` but every value is bound (`$1`/`$2`); the only interpolations come from a closed TS union |
| Upload validation | MIME allowlist **plus** magic-byte sniffing → sharp normalization |
| Webhook auth | `timingSafeEqual`, fails closed on missing/short token |
| Token comparison | `lib/confirm-subscribe.ts:15`, unsubscribe route: length check *before* `timingSafeEqual` — avoids the classic `RangeError` bug |
| Secrets hygiene | `.env` gitignored; `git log --all -- .env` returns nothing |
| CSRF | `SameSite=Lax` + JSON-only mutations + `form-action 'self'` |
| SSRF in `lib/medium.ts`, `lib/embed.ts` | **Safe** — hardcoded URL / no network I/O |

---

## 3. Critical problems, ranked

### P0 — Migration history is missing 4 of 23 models · BLOCKING

Migrations create **19 tables**. `projects`, `project_images`, `email_logs`, `email_events` exist only in `schema.prisma`. They were created with `db:push`, which writes no history.

`scripts/docker-start.sh:5` runs `npx prisma migrate deploy` **on every container start**. Over 40 call sites depend on the missing tables:

- `app/(public)/projects/page.tsx:24`, `app/(public)/projects/[slug]/page.tsx:19`
- `app/sitemap.ts:14`
- `app/api/webhooks/postal/route.ts:33`
- all of `lib/email-tracking.ts`

**Consequence:** any fresh environment — new VPS, disaster recovery, a colleague's laptop, `migrate reset` — boots a database where the projects section and all email tracking return 500 on first request. Production survives only because its DB was hand-pushed and never rebuilt from source. **Restore-from-backup does not currently produce a working system.**

**Fix:** generate a baseline migration via `prisma migrate diff --from-migrations --to-schema-datamodel`, then `migrate resolve --applied` it against prod so it's a no-op there and correct everywhere else. Verify by booting an empty DB and hitting `/projects`.

---

### P1 — Open redirect on the apex domain · HIGH

`app/api/t/click/[id]/route.ts:51`

```ts
target = new URL(url)
if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Unsupported protocol')
...
return NextResponse.redirect(target.toString(), 302)   // ← host never validated
```

Protocol is checked at line 17. The **host never is**. The only gate is a valid `EmailLog` id (line 23) — which an attacker mints on demand: subscribe with a throwaway address, and the confirmation email arrives containing `/api/t/click/<id>?url=...` links already rewritten by `lib/email-tracking.ts:27`. The id never expires and is not single-use.

**Attack:** `https://<your-domain>/api/t/click/clx9k2m0000abc?url=https%3A%2F%2Fyour-domain-login.evil.com`
A phishing link hosted on your own domain — defeating "links must point to our domain" filters and trading on your brand.

**Fix:** resolve `target.hostname` against `NEXT_PUBLIC_SITE_URL`'s host plus an explicit allowlist; or store the permitted destinations per email and match against those; or show an interstitial.

---

### P2 — Rate limiter keyed on attacker-controlled input · HIGH

`app/api/pv/route.ts:37`

```ts
const { ok } = await rateLimit(`pv:${sessionId}`, { limit: 10, windowMs: 60_000 })
```

`sessionId` comes from the **request body** (any 8–64 char string). Rotating it per request bypasses the limiter completely — a rate limit in name only. Each call is an unbounded `prisma.pageView.create`.

**Attack:** loop `POST /api/pv {"path":"/","sessionId":"<random>"}` → analytics poisoning plus unbounded table growth (disk-exhaustion DoS).

**Fix:** key on `getClientIp(req)`, optionally composited with `sessionId`.

---

### P3 — Newsletter send can double-send to the entire list · HIGH

`app/api/admin/newsletter/send/route.ts`

Three compounding defects:

1. **Line 30–38 marks the campaign `status: 'sent'` with the full `recipientCount` before a single email is sent.** The send loop starts at line 41.
2. The only idempotency guard is subject-match within 60 seconds (line 21). A timeout at batch 3 of 100 leaves the DB asserting a complete send; retry after 60s **re-sends to everyone**, duplicating to those already delivered. There is no per-recipient progress record to resume from.
3. **Line 45 re-renders the full React email template once per subscriber.** Subject and body are identical; only `unsubscribeUrl(subscriber.email)` varies. At 5,000 subscribers that's 5,000 renders where 1 render + link substitution suffices.

Additionally line 13 is raw `req.json()` with a truthiness check only — no zod — and `body` is HTML forwarded to every inbox.

**Fix:** persist a `send_job` + per-recipient rows; mark `status: 'sending'` → `'sent'` on completion; resume from unsent rows; render once.

---

### P4 — Regex HTML sanitizer is bypassable · MEDIUM

`lib/sanitize.ts:15` — `EVENT_ATTRS = /\s+on\w+.../` requires **whitespace** before the handler, but HTML parsers accept `/` as an attribute separator. Verified by executing the actual regexes:

```
stripped | <img src=x onerror=alert(1)>    => <img src=x>
BYPASS   | <img/onerror=alert(1) src=x>    => unchanged
BYPASS   | <svg/onload=alert(1)>           => unchanged
BYPASS   | <a href="&#106;avascript:...">  => unchanged
```

`next.config.js:58` sets `script-src 'self' 'unsafe-inline'`, so inline handlers execute — **CSP provides no backstop.**

Coverage itself is fine (applied at read time in `blog/[slug]/page.tsx:158`, `projects/[slug]/page.tsx:169`, `BioSection.tsx:58`; at write time in `app/api/admin/content/route.ts:23`). The sanitizer is the weak link, not its placement.

**Impact is bounded** — only the authenticated admin writes this HTML, and no unauth→stored-XSS chain exists (contact messages render as escaped JSX). This is a defence-in-depth failure, not a live hole.

**Fix:** replace with `isomorphic-dompurify` or `sanitize-html` with an explicit allowlist. Do not hand-roll HTML parsing with regex.

---

### P5 — Other security findings · MEDIUM/LOW

| # | Severity | Finding | Location |
|---|---|---|---|
| 1 | MED | Unauth counter writes on enumerable banner IDs; `/api/banners/active` publishes the IDs; catch block always returns `success:true` | `app/api/banners/event/route.ts:21` |
| 2 | MED | Unbounded `emailEvent` row creation, no rate limit; inflates campaign metrics | `app/api/t/{open,click}/[id]` |
| 3 | MED | Rate limiter **fails open** on Redis error. Defensible for `/api/pv`; for `/api/contact` (2 outbound emails per request) a Redis blip becomes a mail-relay abuse window that burns Postal reputation | `lib/rate-limit.ts:42-46` |
| 4 | MED | `X-Forwarded-For` trusted unconditionally, no trusted-proxy validation; no reverse proxy in `compose.yaml` normalizes it | `lib/rate-limit.ts:50-51` |
| 5 | MED | Newsletter subscribe sends mail to any address named by an unauth caller → third-party email bombing | `app/api/newsletter/subscribe/route.ts:47` |
| 6 | MED | SSRF (authenticated): `fetch(url, {redirect:'follow'})` on scraped URLs, no private-IP filter; external host can 302 to `169.254.169.254` and status is reflected | `app/api/admin/link-check/route.ts:25` |
| 7 | LOW | `ANALYTICS_SALT ?? ''` silently degrades to unsalted `sha256(UA)` — trivially rainbow-tabled, becomes a stable cross-session correlator | `app/api/pv/route.ts:16` |
| 8 | LOW | Unsubscribe/confirm tokens never expire and reuse `NEXTAUTH_SECRET` as HMAC key, coupling session-forgery risk to newsletter-token risk | `lib/unsubscribe.ts:6` |
| 9 | LOW | `POSTAL_WEBHOOK_SECRET` absent from `.env` → webhook safely rejects everything, but **email events are silently not recorded**. Operational check needed | `app/api/webhooks/postal/route.ts:19` |

---

## 4. Performance

| Issue | Evidence | Fix |
|---|---|---|
| **20 pages `force-dynamic`** — every request hits Postgres; homepage fires 14 parallel Prisma queries; no CDN/ISR possible | `grep -rl force-dynamic app --include=page.tsx` → 20 | `unstable_cache` on `lib/content.ts` with tag invalidation wired into existing `revalidatePath` calls |
| **`lib/content.ts` has no caching at all** — only `lib/config.ts` caches (5-min TTL) | — | Same as above |
| Missing indexes | `gallery_items(featured, category)`, `hero_images(active, order)`, `newsletter_campaigns(status)`, `blog_posts(category)` | Add in the P0 baseline migration |
| No connection pool config | `lib/db.ts` uses Prisma defaults | Verify `DATABASE_URL` carries pooling params (Supabase pgbouncer) |
| Newsletter render amplification | N renders instead of 1 (P3) | Render once |
| **57% of `.tsx` files are `'use client'`** (82/143) — many sections client-only just for framer-motion | verified | Lower priority than it looks; measure bundle first |

---

## 5. Maintainability & duplication

*Percentages below are verified line counts where marked, estimates where marked.*

### 5.1 Admin API boilerplate — ~260 of 1,970 lines (**~13%**, verified denominator)

Repeated literally across 41 route files:
- `const session = await auth()` → **62×**
- the 401 return → **60×**
- `if (err instanceof z.ZodError)` → **22×**
- `revalidatePath()` → **26×**

**Fix:** a `withAdmin(schema, handler)` wrapper collapsing auth + parse + ZodError + 500 into one place. Cuts ~200 lines and — more importantly — makes it impossible to *forget* the guard on a new route.

### 5.2 Admin manager components — **~35–45% scaffold** (estimated)

`BannersManager` (782), `BlogEditor` (585), `MediaPickerField` (548), `PressManager` (435), `ClientsManager`, `ServicesManager`, `TestimonialsManager` share a near-identical shape: `useState` list + `handleSave` (POST/PATCH branch, toast, `router.refresh()`) + `handleDelete` (confirm, DELETE, toast).

`TestimonialsManager.handleSave` and `ServicesManager.handleSave` are template-identical apart from field names.

**Fix:** a `useResourceCrud<T>({ endpoint, empty, validate })` hook. Highest-leverage single refactor in the codebase.

### 5.3 `BannersManager.tsx` — 782 lines, worst file

Six `useState` hooks, a 26-field form, 5 async CRUD functions, an inlined 150-line preview modal, and an 8-variant animation config — all in one component.

**Fix:** split into `BannerForm` / `BannerList` / `BannerPreviewModal`, hoist `ANIMATION_STYLES` to a module constant.

### 5.4 Section header markup — ~25 repetitions (estimated ~120 lines)

`Eyebrow` **is** properly shared (32 usages — that's reuse working). The duplication is the surrounding `<h2 className="font-serif text-4xl...">` block and the near-identical framer-motion variant objects (`initial/whileInView/viewport/transition`) repeated across ~30 section files with slightly different magic numbers.

**Fix:** a `SectionHeader` component + a `lib/motion.ts` exporting named presets (`fadeUp`, `fadeUpSlow`). Also fixes the inconsistency — those `y: 12` / `y: 16` / `y: 20` variations are unintentional.

### 5.5 Coupling

- **87 files import `@/lib/db` directly.** No data-access layer; `lib/db.ts` is 279 bytes of client re-export.
- **`components/sections/EmbedSection.tsx` imports Prisma directly** — the one genuine layering violation among components. Should receive data as props.
- `lib/` is a flat 22-file drawer mixing utilities (`sanitize`, `image-utils`), domain logic (`banners`, `embed`, `email-tracking`), and config. No circular imports; no React in `lib/` (both good).
- Hand-written interfaces mirror Prisma models for `Service` and `Testimonial` in 2 files each — schema changes need manual sync.

### 5.6 Proposed structure (incremental, not a rewrite)

```
lib/
├─ data/          queries per entity — the only place importing prisma
├─ domain/        banners, embed, email-tracking, notifications
├─ util/          sanitize, image-utils, local-storage, rate-limit
├─ config/        config, theme, analytics
└─ api/           withAdmin() wrapper, error mapping
components/
├─ ui/            Button, Container, Section, Eyebrow, SectionHeader ←new
└─ admin/
   ├─ hooks/      useResourceCrud ←new
   └─ banners/    BannerForm, BannerList, BannerPreviewModal
```

---

## 6. Gaps

- **No CI/CD whatsoever.** No `.github/workflows`. You have a clean typecheck and 120 passing tests that nothing enforces.
- **`compose.yaml` and `docker-compose.dev.yml` are byte-identical**, both declaring `bodo_*_dev` containers. The README's `docker compose up -d --build` deploys the dev stack. No production compose exists.
- No health checks on app or Redis (Postgres has one).
- **Backups are manual-trigger only** — `scripts/backup.sh` has no cron/systemd timer. Combined with P0, disaster recovery is currently untested and would not work.
- No `loading.tsx`, Suspense boundaries, or skeletons anywhere.
- 53 API endpoints have **zero integration tests**; email tracking, newsletter batching, and the Postal webhook are entirely untested.
- `alt=""` on content images (`BlogSection.tsx:54`) — should be the post title.

---

## 7. Recommended sequence

| # | Work | Risk | Why now |
|---|---|---|---|
| 1 | Baseline migration + `compose.prod.yaml` | None (no behavior change) | Restores deployability and disaster recovery |
| 2 | Open redirect + `pv` rate-limit key | None | Unauth-reachable, curl-exploitable |
| 3 | Swap regex sanitizer → DOMPurify | Low | Removes the XSS class entirely |
| 4 | Newsletter → resumable job | Medium | Before the list grows further |
| 5 | GitHub Actions: typecheck + tests | None | Locks in the green baseline |
| 6 | `unstable_cache` on `lib/content.ts` | Low | Largest per-visitor cost |
| 7 | `withAdmin()` wrapper | Low | Makes forgetting an auth guard structurally impossible |
| 8 | `useResourceCrud` + BannersManager split | Medium | Largest maintainability win |

Items 1–3 are a single focused session and carry no behavioral risk.

---

## Appendix — verification notes

Claims corrected during review rather than relayed as received:

- Admin routes total **1,970** lines, not 961 → boilerplate is **~13%**, not 27%.
- `'use client'` is **82 of 143** `.tsx` files (**57%**), not 86%.
- Auth coverage re-verified at **handler** granularity (62/62), not file granularity — a file can guard `GET` and miss `DELETE`.
- Sanitizer bypasses confirmed by **executing** the regexes, not by inspection.
- `lib/medium.ts` / `lib/embed.ts` SSRF: probed and found **safe** — reported as such rather than padding the finding count.
