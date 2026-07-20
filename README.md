# Bodo Desderio — Personal Brand Site

Dynamic, server-rendered personal brand website for **Bodo Desderio** — Ugandan entrepreneur, software engineer, and community leader. Founder & CEO of Rooibok Technologies Limited, Software Engineer and Head of Software at Kakebe Technologies Limited, former President of the African Youth Congress Uganda Chapter (2023–2024).

Not a developer portfolio. Not a freelance page. A personal brand site for a multi-dimensional founder. Software engineering is one pillar among many.

---

## Who Bodo is — source of truth for copy & tone

- **Founder & CEO**, Rooibok Technologies Limited
- **Software Engineer & Head of Software Dept**, Kakebe Technologies Limited
- **Former President**, African Youth Congress — Uganda Chapter (2023–2024)
- Community builder, STEM advocate, tech camp organiser, anti-corruption essayist (VNSAC234, 2024)
- Based in Kampala, Uganda

Keep this context in mind when writing any copy, designing any UI, or making editorial decisions.

---

## Quick start

```bash
cp .env.example .env     # fill in the blanks
docker compose up -d --build
```

That is the whole workflow. One command, locally and in production.

It builds the image, runs `prisma generate`, applies migrations, seeds the
database **only if it is empty**, and starts the app. There is no separate
migrate step, no separate seed step, and no separate dev command.

Which stack comes up is decided by one variable in `.env`:

| `COMPOSE_FILE` | Stack |
|---|---|
| *(unset)* | `compose.yaml` — dev, hot reload, DB exposed on 5432, port 3001 |
| `compose.prod.yaml` | Production — built image, no DB port published, healthchecks |

Set `COMPOSE_FILE=compose.prod.yaml` on the server only. The command you type
never changes.

App: http://localhost:3001 · Admin: http://localhost:3001/admin/login

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, standalone output) |
| Language | TypeScript strict |
| Styling | Tailwind CSS 3, `darkMode: 'class'`, CSS-variable-driven semantic tokens |
| DB | PostgreSQL 16 (Prisma 5) — self-hosted in Docker, same in dev and prod |
| Auth | NextAuth v5 beta, single admin, JWT session, DB-overridable password hash |
| Email | SMTP via Nodemailer + React Email templates |
| Media | Local uploads in `public/uploads`; Unsplash stock pack via fetch script; local `sharp` for login background webp |
| Rich text | CKEditor 5 |
| Charts | Custom inline SVG sparklines + `recharts` (dynamic import) for the admin visits chart |
| Analytics | First-party page-view table, DNT-respecting, rate-limited |
| Deployment | Docker Compose (app + db), security headers in `next.config.js` |

---

## Project layout

```
app/
├── layout.tsx                    # root — fonts, ThemeProvider, ThemeInjector, JSON-LD
├── (public)/
│   ├── layout.tsx                # public chrome (Header, Footer, PageViewTracker)
│   ├── page.tsx                  # home
│   ├── about|services|gallery|blog|contact/page.tsx
│   └── blog/[slug]/page.tsx + opengraph-image.tsx
├── (admin)/admin/
│   ├── layout.tsx                # admin shell (sidebar + topbar)
│   ├── login/layout.tsx          # passthrough — no shell for login
│   ├── login/page.tsx            # full-bleed bg + glass card
│   ├── page.tsx                  # dashboard (KPI cards + VisitsChart + recent activity)
│   ├── analytics/ account/{profile,preferences,security}/
│   ├── blog/[id]/ content/[page]/ gallery/ media/ newsletter/ messages/
│   ├── clients/ services/ testimonials/
│   └── settings/{appearance,site,navigation,seo,integrations}/
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── contact/ newsletter/subscribe/ pv/
│   └── admin/{blog,clients,config,content,gallery,media,messages,newsletter/send,password,search,seo,services,settings,testimonials,me,appearance/login-background}/
├── opengraph-image.tsx           # dynamic site OG
├── rss.xml/route.ts + sitemap.ts + robots.ts
└── globals.css                   # semantic tokens, utilities

components/
├── admin/                        # AdminShell, AdminSidebar, AdminTopBar, MediaPickerField, BlogEditor, ContentEditor, etc.
│   └── dashboard/                # KpiCard, Sparkline, VisitsChart, QuickActions
├── analytics/PageViewTracker.tsx
├── layout/                       # Header, Footer, PageTransition, ThemeInjector, NewsletterForm
├── sections/                     # ~24 public page sections (Hero, About, Process, Testimonials, Press, etc.)
└── ui/                           # Button, Container, Section, Eyebrow (shared primitives)

lib/
├── auth.ts config.ts content.ts db.ts mailer.ts notifications.ts email-tracking.ts unsubscribe.ts rate-limit.ts schema.ts theme.ts analytics.ts embed.ts media-uploads.ts image-utils.ts banners.ts
└── emails/                       # React Email templates

prisma/
├── schema.prisma
├── seed.ts
└── migrations/                   # committed — prod uses `migrate deploy`

public/
├── favicon.ico + manifest + android-chrome + apple-touch-icon
├── docs/                         # downloadable PDFs (resume)
├── images/
│   ├── clients/ gallery/ icons/ thumbs/ stock/  # on-brand SVG hero fallbacks + legacy raster assets
│   └── press/                    # press / recognition images (VNSAC234 essay poster)
├── stock/                        # Unsplash photo pack (fetched via script, not committed)
└── uploads/                      # runtime admin uploads (login background, etc. — not committed)

scripts/
├── fetch-stock-pack.mjs          # Unsplash pack downloader
└── stock-queries.json            # seed queries
```

---

## Design system

**Theme defaults**

- Public visitors: `next-themes` with `defaultTheme="system"`, `enableSystem`. No visitor-facing toggle.
- Admins: Per-user `theme_preference` column on `admin_users` (`light | dark | system`, default `system`). Topbar selector + `/admin/account/preferences` both bind to it. Applies only inside `/admin/*`; public visitors follow their OS.
- Login page: always dark regardless of site theme (distinct brand moment, photo-friendly).

**Tokens** (CSS vars in `globals.css`)

- Surface: `bg-surface`, `bg-surface-2`, `bg-card`, `bg-muted`
- Text: `text-fg`, `text-fg-muted`, `text-white` (intentional on dark sections)
- Border: `border-hairline`
- Brand: `text-brand`, `bg-brand`, `bg-brand-50` … `bg-brand-900` — all derived from `theme.brand_color` in `site_settings` (admin-editable via Appearance settings)
- Ink scale: `bg-ink-{50..900}` / `text-ink-{50..900}`

**Rules**

1. No default/generic UI — every component feels intentional
2. Typography-first design, aggressive scale contrast
3. Dark mode is first-class — every public surface works in both
4. Whitespace is intentional
5. Subtle motion via Framer Motion — no bouncy effects
6. No shadcn/ui, no Radix, no MUI — Tailwind only
7. Sophisticated palette — warm gold accent (`#C9A84C` default), ink neutrals, clean surfaces
8. All images through Next.js `<Image />`

---

## Content architecture

Every piece of copy lives in `site_content`: `{ page, section, field_key, value, field_type }` rows. Fetch via `getPageContent(page)` in `lib/content.ts`. Never hardcode copy inside JSX — always read from DB.

```ts
// app/(public)/about/page.tsx
const content = await getPageContent('about')
const heading = getField(content, 'hero.heading')
```

Admin edits content at `/admin/content/{page}` with CKEditor for HTML fields and `MediaPickerField` for image fields.

---

## Admin surface

| Group | Pages |
|---|---|
| Overview | Dashboard (`/admin`), Analytics (`/admin/analytics`) |
| Content | Blog Posts, Pages, Gallery, Media Library, Services, Testimonials |
| Audience | Subscribers, Messages, Clients |
| Site | Appearance (brand colour, login bg, availability), Site Settings, Navigation, SEO & Meta, Integrations |
| Account | Profile, Preferences (theme), Security (password) |

**Admin features**

- Collapsible sidebar with 5 grouped sections + mobile drawer
- Topbar with breadcrumb, global search (posts/media/messages/subscribers/clients), quick-create (+ New Post/Testimonial/Gallery/Upload), theme selector (Light/Dark/System), notifications bell with unread count, user avatar
- **Unified MediaPicker** — 4 tabs: Library / Upload from device / Paste URL (auto-detects YouTube, Vimeo, direct image/video/PDF, Google Docs, Notion, X, LinkedIn, Instagram) / Stock (Unsplash pack)
- **Appearance → Login background**: JPEG/PNG/WebP up to 5MB, converted to WebP via `sharp`, last 3 kept in archive
- **Appearance → Brand colour**: hex picker + presets; derived 50–900 palette injected as CSS vars at render time
- **Blog editor**: featured image + required alt text + optional attribution + CKEditor body editor with inline media insert

---

## Security

- CSP, HSTS (2y, preload), X-Frame-Options DENY, Permissions-Policy, `poweredByHeader: false`, `strict-origin-when-cross-origin` referrer
- Middleware guards every `/admin/*` except `/admin/login`
- Admin password bcrypt-hashed (cost 12) — stored in `app_config` table (DB override) with fallback to `ADMIN_PASSWORD_HASH` env var
- Analytics respects DNT header, hashes user-agents with rotatable `ANALYTICS_SALT`, rate-limited per session

---

## Schema (Prisma)

Domain models: `SiteContent`, `SiteSettings`, `SeoSettings`, `AppConfig`, `Media`, `Service`, `Client`, `Testimonial`, `BlogPost`, `GalleryItem`, `Subscriber`, `NewsletterCampaign`, `Message`, `AdminUser`, `PageView`.

`BlogPost` fields include `featuredImageUrl` (required), `featuredImageAlt` (required), `featuredImageAttribution` (JSONB, for stock photographer credit).

`AdminUser.themePreference` — `'light' | 'dark' | 'system'`, default `'system'`. Read in NextAuth `jwt()` callback lazily; refetched via `useSession().update()` when the admin changes it.

---

## Environment variables

See `.env.example` for the full list. Key ones:

- `DATABASE_URL` — PostgreSQL
- `NEXTAUTH_SECRET` — random 32 bytes
- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` — initial admin creds
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — transactional + newsletter email
- `ANALYTICS_SALT` — page-view UA hashing
- `UNSPLASH_ACCESS_KEY` — stock fetch script (optional; only for running `scripts/fetch-stock-pack.mjs`)
- `NEXT_PUBLIC_SITE_URL` — canonical URL for sitemap/OG

---

## Commands

```bash
pnpm dev              # Next dev server (port 3001)
pnpm build            # Production build
pnpm start            # Start production server
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint .
pnpm db:push          # prisma db push (sync schema without migration)
pnpm db:seed          # Seed content
pnpm db:studio        # Prisma Studio

# Stock pack (optional, run once after supplying UNSPLASH_ACCESS_KEY)
node scripts/fetch-stock-pack.mjs
```

---

## Rules Claude/contributors must never break

- No Lorem Ipsum — always real copy rooted in Bodo's actual profile
- No hardcoded content in JSX — always read from `site_content` via content helpers
- No `<img>` — use `next/image`
- No shadcn, Radix, MUI, or Ant Design
- No CSS files — Tailwind utilities only
- No `any` TypeScript — proper types throughout
- No test files unless explicitly requested
- No `console.log` in production — proper error handling
- No visitor-facing theme toggle on the public site — OS preference only
- Login card uses no `dark:` variants (always-dark brand moment)
- Public chrome (Header/Footer) never renders inside `/admin/*`; admin chrome never renders on `/admin/login`

---

## Deployment

Production runs the standalone Next.js build. `scripts/docker-start.sh` applies
migrations and seeds an empty database before starting the server. Committed
migrations in `prisma/migrations/` are the source of truth.

```bash
# on the server, once:
echo 'COMPOSE_FILE=compose.prod.yaml' >> .env

# every deploy after that:
git pull && docker compose up -d --build
```

**PostgreSQL is self-hosted** — it runs as a container in the same stack, with
its data on the `postgres_prod_data` volume. No managed provider. `DATABASE_URL`
is derived from `POSTGRES_*` automatically; do not set it by hand in production.

`compose.prod.yaml` refuses to start if any secret is missing rather than falling
back to a dev default, so a half-filled `.env` fails loudly instead of shipping
`dev-secret-change-me`.

### Schema changes

Never run `prisma db push`. It applies changes without recording a migration,
which is how this project once ended up with tables that existed in the running
database but in no migration file — making a from-source deploy produce a broken
schema. Instead:

```bash
pnpm prisma migrate dev --name describe_your_change   # writes the migration
git add prisma/migrations                             # commit it
```

### Backups

`pnpm db:backup` dumps to `./backups`, keeping the last 7. It is **manual** —
add a cron entry on the server; nothing schedules it for you.
