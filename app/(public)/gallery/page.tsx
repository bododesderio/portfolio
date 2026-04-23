export const dynamic = 'force-dynamic'

import { getPageContent, getField } from '@/lib/content'
import { prisma } from '@/lib/db'
import { GalleryPageClient } from '@/components/sections/GalleryPageClient'
import Image from 'next/image'
import { ldJson, imageGallerySchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gallery — Bodo Desderio',
  description: 'Explore photos from tech camps, community events, and projects.',
}

export default async function GalleryPage() {
  const content = await getPageContent('gallery')

  const hero = {
    title: getField(content, 'hero.heading') || 'Gallery',
    subtitle: getField(content, 'hero.subtitle') || '',
    image: getField(content, 'hero.image') || '/images/stock/gallery-hero.svg',
  }

  const galleryItems = await prisma.galleryItem.findMany({
    include: { media: true },
    orderBy: { order: 'asc' },
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(imageGallerySchema(galleryItems.map(g => ({ url: g.media.url, caption: g.caption, altText: g.media.altText })))) }}
      />
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={hero.image} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">{hero.title}</h1>
          {hero.subtitle && (
            <p className="text-xl text-white/90 max-w-2xl mx-auto">{hero.subtitle}</p>
          )}
        </div>
      </section>

      <GalleryPageClient items={galleryItems} />
    </>
  )
}
