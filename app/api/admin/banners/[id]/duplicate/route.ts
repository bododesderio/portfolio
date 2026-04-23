import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const source = await prisma.banner.findUnique({ where: { id: (await params).id } })
    if (!source) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

    const clone = await prisma.banner.create({
      data: {
        name:            `${source.name} (copy)`,
        kind:            source.kind,
        placement:       source.placement,
        title:           source.title,
        body:            source.body,
        imageUrl:        source.imageUrl,
        ctaLabel:        source.ctaLabel,
        ctaUrl:          source.ctaUrl,
        ctaVariant:      source.ctaVariant,
        dismissable:     source.dismissable,
        requireConsent:  source.requireConsent,
        theme:           source.theme,
        enabled:         false, // clones start disabled
        priority:        source.priority,
        startsAt:        source.startsAt,
        endsAt:          source.endsAt,
        pagesInclude:    source.pagesInclude,
        pagesExclude:    source.pagesExclude,
        devices:         source.devices,
        showOnce:        source.showOnce,
        cooldownHours:   source.cooldownHours,
        delaySeconds:    source.delaySeconds,
        scrollTrigger:   source.scrollTrigger,
        exitIntent:      source.exitIntent,
        newsletterHook:  source.newsletterHook,
      },
    })
    return NextResponse.json(clone, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Duplicate failed.' }, { status: 500 })
  }
}
