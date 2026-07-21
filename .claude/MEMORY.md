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

## [2026-07-21] — Production build verified; two build-only traps fixed

- **Decisions:**
  - Ran the deferred production build (branch `chore/deploy-hardening-and-structure`).
    Exit 0, 57/57 static pages. `unstable_cache` change compiles clean. Fixes in
    `c9db5da`, docs in `20e30f1`.

- **Gotchas (both fail only at `next build`, never at `tsc`/tests/dev):**
  - **isomorphic-dompurify + Next standalone:** it pulls in `jsdom`, which reads
    `browser/default-stylesheet.css` from its own package dir at runtime.
    Webpack-bundling it → `ENOENT` during page-data collection on every route
    importing the sanitizer (first hit: `/api/admin/content`). Fix:
    `serverExternalPackages: ['isomorphic-dompurify', 'jsdom']` in next.config.js.
    Any server-only lib that loads its own on-disk assets needs the same.
  - **`NODE_ENV=development` polluting the build** (it's exported by the dev shell
    profile) makes Next bundle React's dev runtime → prerender crashes with
    `Cannot read properties of null (reading 'useContext')` on `/_global-error`,
    `/terms`, etc., plus `<head>`/`<meta>` unique-key warnings. Build locally with
    `env -u NODE_ENV`. Docker builder stage now pins `ENV NODE_ENV=production`
    (safe — deps install in a separate stage, so devDeps aren't pruned).
  - Next 16.2.4 genuinely supports React 18.2+ (peer deps) — the useContext null
    was NOT a version mismatch. Verify peer deps before blaming versions.

## [2026-07-21] — Branch merged to main; CI removed (account billing-locked)

- **Decisions:**
  - Merged the hardening branch into `main` (PR #1, merge `ffb3ec1`) and deleted
    the branch local + remote. Repo is now single-branch: workflow is edit →
    commit → `git push origin main`, no PRs, no CI.
  - **Removed GitHub Actions entirely** (`.github/` deleted, commit `c6fcaf3`).
    Every run failed at startup in 3–5s with 0 steps. The real cause was only in
    the check-run *annotation*: "The job was not started because your account is
    locked due to a billing issue." Account-level block, not code/workflow — a
    billing lock halts Actions even on public repos. User wanted nothing
    dependent on GitHub billing, so CI is gone.
  - Verified the merged `main` locally instead: typecheck ✅, lint ✅, 159 tests ✅,
    `pnpm build` ✅ (exit 0). This is now the pre-push routine (documented in
    CONTEXT.md and docs/DEPLOY.md).

- **Gotchas:**
  - A 0-step / seconds-long / empty-log Actions failure is a *startup failure*.
    The reason is NOT in job logs or the run archive (both empty) — fetch it from
    `repos/{o}/{r}/check-runs/{id}/annotations`. Don't guess billing vs. runner
    vs. YAML; read the annotation.
  - Pushing a branch containing `.github/workflows/*` needs the OAuth `workflow`
    scope: `gh auth refresh -h github.com -s workflow` (interactive; user runs it
    via `!`). It was the push rejection blocker before the CI file was removed.

## [2026-07-21] — Deferred "pure-churn" refactors: 5 of 6 shipped

- **Decisions:**
  - Shipped as 5 separate reviewable commits (df57d57, c21fe0f, 6d3a638,
    7da9693, 5fcbf4c), each verified by typecheck + lint + 159 tests + a clean
    prod build: withAdmin wrapper (23 CRUD routes), useResourceCrud hook,
    BannersManager split (782→155 orchestrator + 4 files), lib/motion + Section-
    Header, loading skeletons.
  - Nonce-CSP (#6) deliberately NOT done. It isn't pure churn — it changes live
    security headers and needs per-request nonces threaded to next-themes'
    pre-paint script + ~8 inline JSON-LD SEO scripts; high risk (theme flash /
    broken hydration / dropped structured data). XSS already closed by DOMPurify,
    so it's hardening, not a fix. Its own staging-tested PR.

- **Patterns:**
  - "No behaviour change" refactor across many files → delegate the mechanical
    rollout to a subagent AFTER converting one exemplar yourself and pinning the
    rules (exact error strings, status codes, message overrides). Three subagents
    each nailed it and, importantly, *declined* to convert where the abstraction
    would change behaviour (hero-images Prisma-code branches kept inline;
    page-embeds custom `fieldErrors` body kept; HeroImages/Embed managers left
    off useResourceCrud because they use local optimistic state, not
    router.refresh). Instruct them to flag and skip, not force-fit.
  - Run subagents that touch the same directory tree SEQUENTIALLY, not
    concurrently — a second agent's `pnpm typecheck` can trip over the first's
    half-written file and misdiagnose it.

- **Gotchas:**
  - A generic `withAdmin` route wrapper trips Next 16's generated route-type
    validator two ways: (1) deriving `Session` from `ReturnType<typeof auth>`
    resolves to the middleware overload (`NextMiddleware`) — import
    `Session` from 'next-auth' instead; (2) an optional `context?` param makes
    `__param_type__` `RouteContext | undefined` which fails `ParamCheck`. Make
    context required and type its `params` as `Promise<any>` so it satisfies both
    static (`Promise<{}>`) and dynamic (`Promise<{id}>`) routes; narrow to
    Record<string,string> inside.

## [2026-07-21] — Live Playwright audit: CKEditor fixed, two findings open

- **Setup that worked:** isolated scratch stack — Postgres + Redis containers on
  non-conflicting host ports (5432/6379 were taken), `migrate deploy` + `db seed`
  with a KNOWN `ADMIN_PASSWORD_HASH` (bcrypt of a test password) so login is
  controllable without touching real data. `getConfig` reads `appConfig` table
  first (env fallback), and the seed writes ADMIN_PASSWORD_HASH there, so seeding
  with a known hash gives a working login. Ran `next dev -p 3011` with
  NEXTAUTH_URL/AUTH_URL/NEXT_PUBLIC_SITE_URL overridden to the port.
- **Gotcha:** `next dev` (Turbopack) 404s every route under a route group if a
  stale webpack `.next` from `next build` is present. `rm -rf .next` before
  `next dev`. Cost me a while — home worked but /admin/* all 404'd.
- **Verified live end-to-end:** all public pages; contact form + newsletter
  subscribe (persisted, show in admin dashboard); login (wrong+right); Services
  CRUD (create 201 / edit 200 / delete 200) → validates withAdmin + useResource-
  Crud; Banners create/toggle/duplicate + the preview modal → validates the #7
  split; media upload (200, file on disk); SMTP config save (PATCH 200); every
  admin page loads.
- **Fixed (committed `1ee137a`):** CKEditor rich-text editor was fully broken —
  ckeditor5 v48 throws `license-key-missing` without a `licenseKey`. Added
  `licenseKey: 'GPL'` in RichTextEditorInner.tsx editorConfig. Verify commercial
  licensing if the site isn't GPL.
- **All findings now fixed (commits ec063be, 1b1f4bc, 710769d), verified live:**
  1. CSP `img-src` broadened to `https:` (was self/medium only) — external and
     admin-entered image URLs now load. next.config.js.
  2. AxiomUI (`public/js/axiom-ui.js`) no longer upgrades native form controls on
     `/admin` — its MutationObserver was replacing React-managed `<select>`/
     `<input type=file>` with `axm-*` DOM, causing the hydration mismatch AND the
     double file-chooser. `upgradeAll()` now returns early on `/admin`. Public
     theming unchanged. Root cause: AxiomUI mounts in the ROOT layout
     (app/layout.tsx), so it ran on admin too.
  3. Sidebar-missing-after-login: `admin/layout.tsx` gates the AdminShell on the
     session; `LoginForm`'s `router.push('/admin')` reused the login page's stale
     no-session layout render. Fixed by redirecting with `window.location.assign`
     (full nav) so the layout re-runs server-side with the session.
     Pattern to remember: a shared layout that renders different trees by session
     will show the stale tree on client-side nav between its children — force a
     full load (or don't gate the shell in a shared layout).
