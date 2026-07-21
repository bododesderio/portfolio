import { NextResponse } from 'next/server'
import { prisma } from '@/lib/data/db'
import { withAdmin } from '@/lib/util/with-admin'

export const POST = withAdmin(async ({ params }) => {
  const source = await prisma.banner.findUnique({ where: { id: params.id } })
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
}, { onError: 'Duplicate failed.' })
