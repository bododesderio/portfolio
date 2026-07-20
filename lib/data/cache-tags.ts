/**
 * Cache tags for content that public pages read on every request.
 *
 * Public pages are `force-dynamic` and call Prisma directly, so before this
 * every visitor triggered a fresh query for content that changes maybe weekly —
 * the homepage alone fired 14 of them. These reads are now wrapped in
 * unstable_cache and invalidated by tag when the admin saves.
 *
 * Keep the tag list here so producers (lib/data/content.ts) and consumers
 * (the admin write routes) cannot drift apart.
 */
export const CACHE_TAGS = {
  siteContent: 'site-content',
  siteSettings: 'site-settings',
  seoSettings: 'seo-settings',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/** Long TTL: tag invalidation is the real mechanism, this is just a backstop. */
export const CONTENT_REVALIDATE_SECONDS = 3600

/**
 * Next 16 requires a cache-life profile alongside the tag on revalidateTag().
 * 'max' purges regardless of how the entry was cached, which is what an admin
 * save needs — the edit must be visible immediately, not after a TTL.
 */
export const REVALIDATE_PROFILE = 'max'
