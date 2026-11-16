# Portfolio audit and original redesign proposal

**Design status:** The original visual proposal below was rejected and is superseded by the [implemented personal archive redesign](personal-redesign/README.md). Retain this document as the baseline audit; its findings describe the site before that implementation.

**Site:** bododesderio.com · **Observed:** 16 November 2026 · **Scope:** public experience, CMS/admin, API boundaries, database, publishing/email, analytics, SEO, dependencies, and deployment configuration.

The portfolio needs a shorter narrative and a consistent visual system. Its underlying Next.js/PostgreSQL CMS can support that change. Keep the stack, make selected work the centre of the experience, and repair the publishing and configuration paths that currently undermine the admin controls.

**Delivered in this change:** the Google ProfilePage code fix, regression tests, this audit, machine-readable evidence, screenshots, and a working design prototype. **Proposed for subsequent implementation:** the production redesign and the additional backend/security changes below. That baseline audit did not deploy code or change production records. Deployment and implementation follow-up are recorded at the end of this document.

## Review the design

- [Interactive design study](redesign/index.html): Home, Work, About, Writing, Contact, and two venture overview pages.
- [Desktop proposal](audit-2026-11-16/proposal-1440.png) · [Mobile proposal](audit-2026-11-16/proposal-390.png).
- [Current desktop](audit-2026-11-16/home-desktop.png) · [Current mobile](audit-2026-11-16/home-mobile.png).
- [Prototype notes and local preview instructions](redesign/README.md).

The proposal uses existing portrait and site content. The company wordmarks are typographic studies, not approved replacement brand assets. No client results, testimonials, statistics, or project screenshots were invented. The two venture pages are overviews; useful case studies will need verified role, challenge, delivery, and outcome details.

## What was checked

| Area | Evidence and practical limit |
| --- | --- |
| Production pages | All public content URLs in the sitemap, plus privacy, terms, and login, checked on desktop and mobile; an additional dark homepage check. 41 page checks in total; status, title, canonical, headings, schema, image failures, page errors, and page dimensions recorded. |
| Public services | Read-only checks of health, sitemap, both feeds, robots, a missing route, and anonymous admin access. Three sampled admin APIs returned 401; `/admin` redirected to login. No production form submissions, login attempts, uploads, campaign sends, or other deliberate mutations. |
| Backend | Inventoried 53 API route files, including 41 admin files. All admin files have an auth guard in their source. Reviewed sensitive flows and shared validation, sanitization, signing, rate limiting, caching, and storage helpers. This is an architectural/code audit, not a penetration test of every request combination. |
| Local production runtime | Production build against a disposable, seeded database. Correct JSON-LD checked in the rendered HTML of Home, About, and Contact. Signed in using an isolated test admin; 24 admin screens returned 200 without error boundaries or captured JavaScript page errors. Blog and project edit screens also returned 200 with CKEditor mounted. |
| Reproduced backend faults | A saved homepage SEO title was ignored by the rendered page. Login with Remember me unchecked returned an expiry approximately 30 days away. Both reproduced only in the scratch environment. |
| Database | All nine committed migrations applied to an empty PostgreSQL database. The available cached test image was PostgreSQL 17; production declares PostgreSQL 16. This does not replace a PostgreSQL 16 restore/drift check against production. |
| Repository checks | TypeScript and ESLint passed; 163 tests passed, including four new schema regressions; the production build completed. Existing mocked API tests are useful coverage, not proof of live SMTP delivery or campaign correctness. |
| Prototype | Seven layouts at 320, 390, 768, and 1440 pixels: 28 checks with no horizontal overflow, one visible H1, and no broken visible images. Mobile menu, route selection, browser Back, and Escape checked. |
| Dependencies | `pnpm audit --prod --json` reported 109 advisory records: 9 critical, 43 high, 45 moderate, 12 low. These are registry matches, not 109 independently demonstrated application vulnerabilities. Preconditions and upstream severity classifications vary. |

Evidence: [production observations](audit-2026-11-16/live-audit.json), [local checks](audit-2026-11-16/local-verification.json), [API inventory](audit-2026-11-16/api-inventory.json), [dependency advisory details](audit-2026-11-16/dependency-audit.json). Browser timings are single-run observations without controlled throttling; they are **not Core Web Vitals or Lighthouse scores**. Production host access, private production admin actions, external mail delivery, backup restoration, and Search Console validation were outside these checks.

## Google warning: cause and completed correction

The live `/about` ProfilePage contains `mainEntity: { "@id": "https://bododesderio.com/#bodo" }`. The referenced Person was emitted by `metadata.other` as `<meta name="application/ld+json" ...>`, rather than a JSON-LD script. Consequently, the profile script did not contain a resolvable, typed Person.

Changes in [lib/schema.ts](../lib/schema.ts) and [app/layout.tsx](../app/layout.tsx):

1. Emit the shared Person and WebSite as an escaped `application/ld+json` script. JSON-LD is non-executable; the request nonce remains on executable framework/theme scripts.
2. Embed the named `Person` directly within ProfilePage `mainEntity`, retaining the same stable entity ID.
3. Normalize trailing slashes in the schema base URL to avoid inconsistent entity IDs.
4. Omit the generic wordmark social card from the Person's optional `image` field. A real portrait can be supplied later from the CMS. Remove the declared SearchAction because `/blog?q=...` does not drive the current client-only search.

Four tests cover a standalone named Person, publisher identity, URL normalization, and script-breakout escaping. Browser checks against the production build confirm valid JSON parsing and the expected Person/WebSite/ProfilePage objects. This satisfies the documented structure; Google's final eligibility decision has not been tested against a deployed fix. Google requires a Person or Organization for `mainEntity` and cautions against placeholder profile images. [Google ProfilePage documentation](https://developers.google.com/search/docs/appearance/structured-data/profile-page).

After deploying this fix, run the live `/about` URL through Google's Rich Results Test, inspect the live URL in Search Console, and select **Validate fix** in the Profile page issue report. Re-crawling is required before the email's warning disappears.

## Prioritized findings

P0 means remediate before the redesign rollout; P1 means the next functional/visual release; P2 means the following reliability and maintenance pass. A code observation is distinguished from a demonstrated runtime failure below.

| Priority | Finding and evidence | Recommended change |
| --- | --- | --- |
| P0 | **Production dependency updates need triage.** Locked Next 16.2.4, NextAuth beta.31, sharp 0.34.5, sanitizer dependencies, editor, and mailer have registry advisory matches. See the advisory artifact. | Upgrade in a separate tested change, starting with the framework/auth/image pipeline. Check affected dependency paths, production container libc, and feature prerequisites; retain migration and browser regression checks. Do not apply a blind major-version audit fix. |
| P0 | **Auth guards accept any truthy auth object.** `proxy.ts`, `lib/util/with-admin.ts`, and many inline guards use `!session`/`!req.auth`. Installed NextAuth beta.31 matches the upstream configuration-error advisory. Ordinary unauthenticated production requests were denied during this audit. | Require a concrete authenticated user identity and the configured admin identity, fail closed on malformed/error sessions, and upgrade Auth.js. Add a regression where `auth()` returns an error-shaped object. Test missing/misconfigured secrets on an isolated instance. |
| P1 — fixed locally | **Profile entity unreadable by Google.** Reproduced in the live About JSON-LD. | Deploy the completed schema fix and request Search Console validation. |
| P1 | **Homepage lacks focus.** `app/(public)/page.tsx` composes up to 15 sections. About and Bio overlap; services, process, tools, community, press, clients, testimonials, blog, CTA and availability all compete. | Reduce to introduction, selected work, brief approach, selected writing, and contact. Move depth to dedicated pages. |
| P1 | **Visual language varies by section.** Inter, Playfair, italic display text, monospace labels, numerous small type sizes, gold, slate, ink, grids, glow, and dark/light bands coexist. | One font family, three main weights, a small type scale, two text tones, and semantic colors used consistently. Remove decorative background layers and repeated badges. |
| P1 | **Font import and usage disagree.** Imported `@fontsource-variable/inter` declares `Inter Variable`; `app/globals.css` uses `Inter`. | Use the declared family consistently or self-host one explicitly named variable face. Verify actual rendered fonts, not only computed CSS family strings. |
| P1 | **Default gold lacks contrast for normal text.** `#C9A84C` against white is approximately 2.29:1. Small white-on-gold buttons and gold-on-white labels occur throughout the source. | Use charcoal buttons and a darker gold for functional text. Proposed `#806420` is approximately 5.58:1 on white; keep pale gold decorative. Validate configured brand colors in both themes. |
| P1 | **Mobile hero prioritizes the photograph over the introduction.** Current DOM order displays the portrait first and clips it to 320px; primary action is near/below the initial viewport. | Put role, introduction, and primary action before the portrait on mobile. Remove the image carousel and its layered background. |
| P1 | **SEO settings save but do not affect public metadata.** `getSeoSettings` has no callers in public pages. Scratch PATCH returned 200 while the saved title was absent from the next rendered page. | A shared server metadata builder must read CMS overrides and merge them with route defaults, canonical, social image, and a single title template. Test a save followed by a public page read. |
| P1 | **Remember me does not enforce the claimed short lifetime.** `lib/auth.ts` writes `token.exp`, while the installed Auth.js encoder sets expiration from its configured maxAge. The unchecked login returned a roughly 30-day expiry locally. | Enforce a server-validated session deadline for short sessions; make cookie/token expiry consistent and verify both options using decoded tokens and elapsed-time tests. Add session revocation/versioning for password rotation. |
| P1 | **Newsletter retries do not provide reliable delivery.** Send route resumes by subject, renders the new request body rather than the persisted campaign body, marks completion despite failures, and has no atomic campaign/recipient claim. Email logs start as `sent` before SMTP acceptance. | Persist campaign content and a recipient snapshot; claim work atomically; use pending/sending/sent/failed states and a unique campaign-recipient key; send through a durable worker with retry policy. A crash during external SMTP acknowledgement remains an ambiguous-delivery case and needs reconciliation. |
| P1 | **Client IP trust is broader than the documented topology.** `getClientIp` unconditionally accepts `cf-connecting-ip`, while the recorded production topology uses direct Traefik routing. | Confirm edge header stripping. Trust Cloudflare headers only from a verified Cloudflare ingress; otherwise use the explicitly trusted proxy chain. Test forged headers. Actual exploitability depends on edge configuration, which was not inspected. |
| P1 | **Broken production images.** Gallery optimizer returned 400 for `IMG_2496.JPG` and `tt.JPG`; About also requested the former unsuccessfully on desktop. | Inspect source files and decoder errors, re-encode/replace the damaged assets, validate ingestion, and provide an accessible fallback. Validate images after scrolling through the complete gallery, not only initial visible tiles. |
| P1 | **Browser copy and context menus are disabled globally.** `ContentProtection` is mounted in the root and prevents copy/cut/context menu on public and admin pages. | Remove the interception. Visitors should be able to copy contact details and editors should retain normal clipboard behaviour. Replace AxiomUI's global DOM upgrades with explicit React-owned controls as relevant screens are rebuilt. |
| P2 | **Homepage highlights the wrong resource.** FeaturedProjectSection queries `galleryItem.featured`; the dedicated Project model already has a `featured` field. | Query visible, featured Projects with explicit ordering and a limit of two or three. Keep gallery selection separate. |
| P2 | **Request-time work is larger than necessary.** Homepage queries execute sequentially; services/clients/testimonials/press/blog reads remain per-request; Medium fetching has no explicit timeout. | Parallelize independent queries, select only needed fields, bound result sizes, cache collection reads with resource tags, and cap external fetch duration. Public pages remain dynamic because nonce handling reads request headers; that is an intentional security tradeoff. |
| P2 | **Database errors can look like empty content.** `lib/data/content.ts` catches runtime errors inside cached functions and returns `{}`/`null`; many page reads silently return empty arrays. | Keep build-time handling explicit. Log runtime failures, retain last-good optional content, and show an honest failure for essential content. Do not cache an outage as a successful empty page. |
| P2 | **Cache invalidation comments promise stronger behaviour than the API.** `REVALIDATE_PROFILE='max'` is described as immediate purging. | Decide whether each edit permits stale-while-revalidate. Use an immediate expiration policy for CMS reads requiring freshness and test the first public request after saving. Next documents `max` as serving stale data while refresh runs. [Next documentation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag). |
| P2 | **Metadata hygiene needs a common path.** Live titles repeat “Bodo Desderio”; Home, Privacy and Terms have no canonical; admin/login inherits root indexing permission. Project metadata lookup does not filter `visible`. | Generate titles once, emit per-route canonicals, set admin/auth pages to noindex, and use the same publication/visibility predicate in metadata, page, image, feed, and sitemap queries. |
| P2 | **Robots and feed responsibilities are duplicated.** `public/robots.txt` and `app/robots.ts` disagree; the live robots response does not contain the sitemap/admin rules declared by the TypeScript route. Two RSS implementations have different channel metadata. | Choose one robots source while preserving intentional crawler restrictions. Use one feed generator with the other URL as a compatibility alias. Preserve URLs during redesign. |
| P2 | **Image ingestion uses inconsistent validation.** General upload saves an extension derived from the supplied filename; SVG filtering is regex-based. Login image processing falls back to saving original bytes when decode/conversion fails. | Centralize ingestion: reject decode failures, derive extensions from validated media, limit pixels and bytes, normalize raster images, and handle PDFs separately. Sanitize/rasterize SVG with a maintained parser or serve downloads from a separate origin. These are authenticated paths; arbitrary code execution was not demonstrated. |
| P2 | **Contact success and notification delivery are conflated.** Message is stored before admin config validation; mail results are discarded via allSettled. Confirmation emails are sent synchronously and email addresses are not consistently normalized. | Persist the message once, queue notifications with observable retry state, distinguish receipt from delivery, add bounded field lengths and an idempotency key, and normalize subscriber addresses before lookup/upsert. |
| P2 | **Postal events can overcount on retry.** Webhook writes an event and increments campaign counters without a provider-event uniqueness key. Existing context says its production secret is unset; this audit did not access production configuration to re-verify that claim. | Confirm configuration, authenticate events, deduplicate provider events transactionally, and derive counts from delivery records. Show integration health in admin. |
| P2 | **Consent and promotional UI are coupled loosely.** PageViewTracker only reacts to pathname; accepting consent does not trigger the initial view. BannerRenderer directly accesses localStorage; modal lacks dialog/focus management and multiple fixed UI elements can compete. | Centralize consent state, trigger one view on acceptance, tolerate unavailable storage, use an accessible dialog, and limit simultaneously displayed overlays. Default this portfolio to no promotional popup. |
| P2 | **Social embeds do not match CSP capabilities.** EmbedSection supports YouTube/Vimeo frames while frame-src allows only self/Calendly; Twitter/Instagram blockquotes have no corresponding widget script integration there. | Prefer simple external cards; where embeds are necessary, add explicit consent-aware loading and the minimal documented CSP origins. Validate each supported platform end to end. |
| P2 | **Presentation depends heavily on animation JavaScript.** PageTransition server markup starts at opacity 0, while many section animations separately start hidden. CSS reduced-motion rules do not directly disable Framer Motion's JS animations. | Render primary content visible by default. Use limited progressive enhancement and Framer's reduced-motion setting; verify with JS disabled and reduced motion enabled. |
| P2 | **Large content collections load in full.** BlogGrid/ProjectGrid paginate after receiving complete collections; rich fields are fetched where summaries suffice. Dashboard sends multiple time windows and groups all sessions in application memory. | Paginate/search on the server with bounded projections; fetch dashboard ranges when selected; count distinct sessions in PostgreSQL. Add indexes only after measuring representative queries. |
| P2 | **Operational recovery is unverified.** Health only checks PostgreSQL; repo backup script covers DB rather than uploads and no scheduler is in compose. Docker pins Node 20 while this workstation runs Node 24. Existing context intentionally disables GitHub Actions. | Add dependency-aware readiness, structured failure logs, scheduled encrypted off-host DB+upload backups, and a restore rehearsal. Pin a supported runtime/package manager and keep the existing local validation workflow until CI is usable. |

### Dependency applicability matters

The upstream [Auth.js advisory](https://github.com/nextauthjs/next-auth/security/advisories/GHSA-8fpg-xm3f-6cx3) describes the truthy-error-session pattern found here, conditional on configuration failure. Its repository severity is Low while the registry/GitHub database used by pnpm labels the match Critical; preserve that distinction when triaging.

The [Next ImageResponse advisory](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) requires attacker-controlled SVG content/attributes/styles in the Node implementation; a version match alone does not demonstrate that condition in these templates. The [SVG image optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) specifies glibc-based Linux, while the production Dockerfile declares Alpine. Windows-only findings do not apply to that declared deployment. These constraints reduce specific exposure claims; they do not remove the need for a tested dependency refresh and a re-scan of the actual deployment image.

## Proposed information architecture

Keep current URLs for continuity. Change labels and page composition before considering URL migrations.

| Destination | Navigation label | Content |
| --- | --- | --- |
| `/` | Name/wordmark links home | One introduction; two selected projects/ventures; brief approach; two writing links; one closing contact invitation. |
| `/projects` | Work | Selected, publicly visible work with concise role/context. Planned ideas should be a clearly secondary collection, excluded from homepage selections by default. |
| `/projects/[slug]` | Work detail | Overview → Challenge → My role → Approach → Delivered work → Verified results → Next project. Omit empty sections. |
| `/about` | About | Short story, current work, concise milestones, community contribution, optional downloadable CV. |
| `/blog` | Writing | Readable article list, categories/search when justified, and one optional inline subscription form. |
| `/blog/[slug]` | Article | A focused reading column, meaningful image/attribution, author/date, and restrained related reading. |
| `/contact` | Contact | A direct introduction, short accessible contact form, email, and optional booking link. One clear success state. |
| `/services` | Secondary/footer | Concise capabilities and engagement information. Can be linked from Contact/Work without occupying primary navigation. |
| `/gallery` | Secondary/footer or About | Curated personal/community photography. Retain route; remove the need to browse it to understand the professional offering. |
| Privacy, Terms, RSS | Footer | Simple document layouts and stable links. |

### Homepage content migration

| Existing material | Proposed destination |
| --- | --- |
| Hero, location, availability | One quiet introduction. Availability is optional supporting text. |
| About + Bio + mission | A short homepage summary; full story on About. |
| Featured gallery image | Replace with actual featured Projects. |
| Expertise + process + tools + engagement models | Services/Work context. Technology tags belong on relevant project details. |
| Community, press and personal gallery | About, with links to verified external coverage. |
| Clients and testimonials | Optional proof next to the work they support. Avoid an independent logo carousel and an unrelated full testimonial band by default. |
| Blog + external writing | Two selected links on Home; the full collection in Writing. |
| CTA + availability + footer signup | One closing contact invitation. Keep subscription in Writing rather than repeating it on every page. |

The live Home measured 13,384px at desktop and 20,092px at 390px mobile. The current proposal is approximately 2,863px and 3,267px respectively, with substantially less content. These are layout measurements of different compositions, not a speed benchmark.

## Visual specification

**Direction:** quiet, professional, human. Give the portrait and actual work enough room, while keeping interface decoration subordinate.

| Element | Proposed rule |
| --- | --- |
| Typography | One self-hosted Inter variable family. Body 16–18px; labels 12–14px; cards 20–24px; section headings 30–42px; hero 36–68px. Weights 400, 500, 600. Avoid italics, mono labels, and extra-wide uppercase tracking in regular UI. |
| Color | Warm white `#FAFAF8`, charcoal `#202723`, secondary text `#626862`, borders `#DEDFD8`, restrained functional gold `#806420`. Project imagery can carry additional color. |
| Layout | Maximum content width approximately 1160px, reading width 640–680px, 20px mobile gutters, a consistent spacing scale. One alignment system across pages. |
| Components | One primary charcoal button, one text-link treatment, simple project and article rows, subtle 5–8px corners, visible focus rings. |
| Imagery | One portrait, no rotating hero backdrop. Actual product screenshots for case studies when available. Preserve accurate image descriptions and attribution. |
| Motion | Small hover transitions; no mandatory reveal animation, scrolling marquees, or auto-rotation. Content remains readable before hydration. |
| Navigation | Work / About / Writing / Contact. Name links home. Accessible mobile disclosure with Escape handling; mark current page. |
| Footer | Name, concise role, selected social/contact links, copyright, Privacy/Terms. No oversized wordmark or site-wide newsletter block. |
| Dark mode | Keep an independently checked charcoal/light-text palette when implementing production. The review prototype is intentionally light-only. Admin theme remains a separate preference. |

### Admin redesign

Group work by task: **Overview, Content, Audience, Settings**. Under Content, offer Pages, Projects, Writing, Media, and reusable proof such as Testimonials. Put Banners, Embeds, and Integrations behind secondary settings rather than making every subsystem equally prominent.

The overview should prioritize unread enquiries, drafts, recent edits, and integration health. Move detailed traffic/email analysis to dedicated views. Page editors should use structured sections with real previews, sensible defaults, explicit visibility controls, and one consistent save state. Keep drafts and published content distinct; avoid a general-purpose page builder that permits the same visual overload to return.

## Backend design to support the UI

1. **Shared public read layer.** Keep RSC → Prisma. Add bounded, typed readers for identity, page content, featured projects, article summaries, and metadata. Cache immutable/slow-changing summaries with resource-specific invalidation. Avoid calling the app's own HTTP endpoints from server code when shared domain functions suffice.
2. **One public identity source.** Drive name, portrait, role, social links, contact details, schema, and metadata from validated settings with explicit fallback values. Preserve the stable Person ID. Validate public navigation URLs and JSON shapes before rendering; JSON.parse alone is insufficient for admin-provided configuration.
3. **A structured content contract.** Retain existing tables initially. Add typed validation for supported page sections and lengths; introduce additive fields only for actual project case-study needs. Keep editorial data separate from typography/layout tokens. Save logically related settings atomically.
4. **A reliable delivery boundary.** Contact receipt and campaign creation commit to PostgreSQL. An outbox/worker handles SMTP separately, with idempotency, retry state, dead-letter visibility, unsubscribe checks at send time, and deduplicated webhook updates. Use the existing PostgreSQL/Redis infrastructure rather than introducing unrelated services.
5. **Explicit auth and media policies.** Validate the concrete admin identity at each API boundary; enforce session deadlines and revocation. Centralize verified media handling. Keep the current HTML sanitizer, URL signing, and rate limiting while upgrading their vulnerable dependencies and tightening edge trust.

No schema changes are needed for the delivered Google fix or to begin the visual redesign. Delivery/outbox and richer case-study changes should use committed, reviewed migrations. Do not use `prisma db push` against production.

## Rollout and acceptance

1. **Immediate correction and hardening:** deploy the schema fix, validate `/about`, triage/patch dependencies and auth guard behaviour. Record the deployed commit. Keep the visual proposal independent so it does not delay the Google repair.
2. **Visual foundation and public pages:** implement tokens, font loading, Header/Footer, Home, Work/detail, About, Writing/article, Contact, and supporting routes. Keep existing CMS content and URL paths; migrate the homepage selections deliberately.
3. **Backend correctness:** wire CMS metadata, fix session policy, consolidate public reads, restore gallery assets, and add reliable email work states. Validate each save/publish path against the first public read.
4. **Admin and operations:** simplify navigation/editors, add integration status, verify backups and restores, then deploy after staging acceptance.

Release criteria:

- Google live URL/Rich Results checks recognize a named Person in ProfilePage; no invalid metadata substitute remains.
- Metadata overrides, visibility changes, and selected work updates appear as intended after saving; titles contain the brand once.
- All retained public URLs work; no missing images or new browser errors; required redirects preserve external links.
- At 320/390/768/1440 pixels, navigation, form, footer and work layouts fit without horizontal overflow; keyboard and reduced-motion checks pass.
- Normal copy/clipboard behaviour works in public pages and CMS. Dialogs and forms have accessible labels, focus and errors.
- Session lifetime matches the checkbox policy; malformed/error-shaped sessions are denied; password rotation revokes sessions as designed.
- Contact receipt survives SMTP failure; campaign retries cannot silently complete failed work or mix content; webhook retries do not duplicate counters.
- Production-like dependency scan is triaged, local type/lint/test/build checks pass, and a backup/rollback plan is verified.

The next concrete decision is the visual direction shown in the prototype. The production application remains on its existing UI until that proposed redesign is implemented.

## Implemented follow-up

The original design proposal above is superseded by [the personal archive implementation](personal-redesign/README.md). The follow-up fixes the ProfilePage JSON-LD, verifies concrete authenticated identities at admin boundaries, repairs uppercase gallery image optimization, makes the public content visible without JavaScript, and adds bounded public search and server-filtered archives. Production has been backed up before the app-only deployment.

The second UI pass also redesigns the administration workspace, editors, inbox, and content lists. It removes analytics queries from the main overview, counts distinct visitor sessions in PostgreSQL, adds work to authenticated search, prevents stale search responses, corrects global list counts, retains filters during pagination, preserves in-progress fields during section collapse/filtering, and fixes the timeline editor's field-shape mismatch. All admin pages now inherit noindex metadata. See the release report and verification artifacts for actual checks.

This is not a claim that every baseline backend finding is closed. Dependency refreshes, stricter session-expiry policy, durable campaign delivery and webhook deduplication, centralized upload ingestion, and scheduled off-host recovery/restore rehearsals remain separate follow-up work.
