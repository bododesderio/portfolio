FROM node:20-alpine AS base
RUN apk add --no-cache openssl ca-certificates libc6-compat
RUN npm install -g pnpm@9

# ── deps ──────────────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# High timeout + retries for slow connections (CKEditor packages are large)
RUN pnpm config set fetch-timeout 300000 && \
    pnpm config set fetch-retries 5 && \
    pnpm install --frozen-lockfile

# ── builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Use npx in builder — pnpm-workspace.yaml causes "packages field missing" errors
# v2: theme templates, pagination, nav editor, profile edit, double opt-in
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
# Pin production explicitly. If NODE_ENV=development leaks into the build env,
# Next bundles React's dev runtime and prerendering crashes with a useContext
# null error. Deps are installed in the `deps` stage (devDeps intact), so this
# only governs the build, never pruning packages.
ENV NODE_ENV=production
# Dummy URL for build — real URL injected at runtime
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
RUN npx next build --webpack

# ── runner ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
# Whole scripts dir: docker-start.sh sources seed-if-empty.sh, and `set -e`
# would abort the container on boot if it were missing.
COPY --from=builder /app/scripts ./scripts

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "scripts/docker-start.sh"]
