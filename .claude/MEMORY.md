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
