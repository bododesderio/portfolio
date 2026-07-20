# ADR-001 — Subdomain architecture

**Date:** 2026-07-20
**Status:** Accepted, not yet implemented (domain not acquired)

## Context

Target layout:

| Host | Serves |
|---|---|
| `bododesderio.com` | Public site |
| `admin.bododesderio.com` | Admin UI |
| `api.bododesderio.com` | Backend API |
| `media.bododesderio.com` | Uploaded media (Cloudflare R2) |

The application is a single Next.js App Router monolith. `app/api`, `app/(admin)`
and `app/(public)` are route groups in one server — they are not separable
services without a rewrite.

## Decision

**Route by host into the same Next.js app.** A reverse proxy terminates TLS for
all three app hostnames and forwards to one container; middleware maps host →
internal path. `media.` is the exception: it is not Next.js at all, it is an R2
bucket behind Cloudflare.

Rejected: splitting into separate deployable services. It would mean extracting
the API into a standalone server, duplicating the Prisma layer and auth, and
running two more containers — months of work, for a single-admin site whose
traffic fits comfortably in one process. The URL structure is the actual goal,
and host routing delivers it in full.

## Session isolation — the part that matters

Serve the admin UI **and the admin API from the same host**:

```
admin.bododesderio.com/            → admin UI
admin.bododesderio.com/api/admin/* → admin API
```

The session cookie is then scoped to `admin.bododesderio.com` alone. It is never
transmitted to the public site, and never to `api.`. This is strictly better than
today, where one origin serves everything.

**Do not scope the cookie to `.bododesderio.com`.** A parent-domain cookie is
sent to every subdomain, so an XSS on the public marketing site would expose the
admin session. Only widen the cookie if `api.` ever needs to read the session —
and prefer a bearer token over widening it.

`api.bododesderio.com` then carries only unauthenticated endpoints: `/api/contact`,
`/api/newsletter/*`, `/api/pv`, `/api/t/*`, `/api/banners/*`, `/api/webhooks/*`.

### Cost to be aware of

The public site's browser calls (contact form, newsletter, page-view beacon)
become **cross-origin** once they target `api.`. That requires CORS on those
routes with an explicit origin allowlist — `Access-Control-Allow-Origin:
https://bododesderio.com`, never `*`. Preflight also adds a round trip to the
page-view beacon.

If that is not worth it, the cheaper option is: the public site keeps calling its
own same-origin `/api/*`, and `api.` exists as an additional public hostname for
external consumers. Same URL structure, no CORS. **Recommended starting point.**

## Implementation sketch

**1. Proxy** (Caddy shown; Traefik/nginx equivalent). Caddy handles Let's Encrypt
for all hosts automatically:

```caddyfile
bododesderio.com, admin.bododesderio.com, api.bododesderio.com {
    reverse_proxy app:3000 {
        header_up Host {host}
        header_up X-Forwarded-For {remote_host}   # overwrite, never append
    }
}
```

`X-Forwarded-For` must be **overwritten** by the proxy, not appended. `getClientIp`
in `lib/util/rate-limit.ts` reads the leftmost value, so an appending proxy lets a
client spoof its own IP and defeat the contact/subscribe/page-view limiters.

**2. Host → path rewrite** in `proxy.ts`:

```ts
const host = req.headers.get('host') ?? ''

if (host.startsWith('admin.') && !req.nextUrl.pathname.startsWith('/admin')) {
  return NextResponse.rewrite(new URL(`/admin${req.nextUrl.pathname}`, req.url))
}
if (host.startsWith('api.') && !req.nextUrl.pathname.startsWith('/api')) {
  return NextResponse.rewrite(new URL(`/api${req.nextUrl.pathname}`, req.url))
}
```

The middleware `matcher` must widen to `['/((?!_next/static|_next/image|favicon.ico).*)']`
for host inspection to run at all — it currently only matches `/admin/*` and
`/api/admin/*`.

**3. Env**

```
NEXTAUTH_URL=https://admin.bododesderio.com    # auth lives on the admin host
NEXT_PUBLIC_SITE_URL=https://bododesderio.com
NEXT_PUBLIC_API_URL=https://api.bododesderio.com
NEXT_PUBLIC_MEDIA_URL=https://media.bododesderio.com
```

`NEXT_PUBLIC_SITE_URL` is used to build tracking-pixel and click-tracking links in
`lib/domain/email-tracking.ts`, and by `isSameOriginUrl` in `lib/util/link-signing.ts`.
If email links should resolve through `api.`, change it there deliberately —
changing this value invalidates the same-origin fallback for links in already-sent
emails.

**4. Canonical host.** `bododesderio.com` and `www.` must 301 to one canonical
host, and `app/robots.ts` / `app/sitemap.ts` must emit only canonical URLs, or
the same content gets indexed under three hostnames.

## media.bododesderio.com — R2

Uploads currently go to local disk (`public/uploads`, `lib/domain/media-uploads.ts`
+ `lib/util/local-storage.ts`) on a Docker volume. That is single-host, not
CDN-backed, and outside the database backup.

R2 is S3-compatible, so `@aws-sdk/client-s3` works against it. The
`Media.storageId` column already exists — it was renamed from `cloudinaryId` in
the `20260426000000` migration, so the schema is already shaped for remote
storage and **no migration is needed**.

Plan:

1. Add an R2 client behind the existing `lib/util/local-storage.ts` interface, so
   call sites do not change.
2. Choose driver by env (`STORAGE_DRIVER=local|r2`) — local stays the default for
   development, so contributors need no cloud credentials.
3. Keep the sharp→WebP step and the MIME + magic-byte validation exactly as they
   are. They run before upload and are not storage-specific.
4. Serve via `media.bododesderio.com` mapped to the bucket; add the host to
   `next.config.js` `images.remotePatterns`.
5. Backfill existing files with a one-off script; `storageId` gives each row a
   stable key.

Bucket must be **private with public read through Cloudflare only** — never a
publicly writable bucket. Credentials belong in `AppConfig` (already AES-256-GCM
encrypted) or env, never in the repo.

## Phasing

| Phase | Work | Blocked on |
|---|---|---|
| 1 | Acquire domain, DNS A records for apex + `admin` + `api` | — |
| 2 | Caddy in `compose.prod.yaml`, TLS for all hosts | Phase 1 |
| 3 | Host→path rewrite in `proxy.ts`, widen matcher, canonical redirect | Phase 2 |
| 4 | R2 bucket + storage driver + `media.` | Phase 1 |
| 5 | CORS on public API routes — only if the public site is moved to call `api.` | Phase 3 |

Phases 1–3 change no application behaviour; they only change how requests reach it.
