import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { matchesPath, type PublicBanner } from '@/lib/banners'

export const dynamic = 'force-dynamic'

/**
 * Public endpoint — returns active banners matching the current path and time.
 * Rate-limit noise is fine (read-only); results are filtered further by the
 * client orchestrator (device, frequency, triggers).
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/'
  const now = new Date()

  try {
    const rows = await prisma.banner.findMany({
      where: {
        enabled: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null },   { endsAt:   { gte: now } }] },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    })

    const filtered: PublicBanner[] = rows
      .filter(r => matchesPath(path, r.pagesInclude, r.pagesExclude))
      .map(r => ({
        id: r.id,
        kind: r.kind as PublicBanner['kind'],
        placement: r.placement,
        title: r.title,
        body: r.body,
        imageUrl: r.imageUrl,
        ctaLabel: r.ctaLabel,
        ctaUrl: r.ctaUrl,
        ctaVariant: r.ctaVariant,
        dismissable: r.dismissable,
        requireConsent: r.requireConsent,
        theme: r.theme,
        priority: r.priority,
        pagesInclude: r.pagesInclude,
        pagesExclude: r.pagesExclude,
        devices: r.devices,
        showOnce: r.showOnce,
        cooldownHours: r.cooldownHours,
        delaySeconds: r.delaySeconds,
        scrollTrigger: r.scrollTrigger,
        exitIntent: r.exitIntent,
        newsletterHook: r.newsletterHook,
      }))

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json([])
  }
}
