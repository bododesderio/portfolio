import type { Metadata } from 'next'
import { prisma } from '@/lib/data/db'
import { getPageContent, getField } from '@/lib/data/content'
import { ldJson, imageGallerySchema } from '@/lib/schema'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { PhotoCollection } from '@/components/personal/PhotoCollection'
export const dynamic = 'force-dynamic'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
export const metadata: Metadata = {
  title: 'Photographs',
  description:
    'A personal photo archive of Bodo Desderio: work, community, people, and moments along the way.',
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: { title: 'Photographs · Bodo Desderio', url: '/gallery' },
}
export default async function GalleryPage() {
  const [content, items] = await Promise.all([
    getPageContent('gallery'),
    prisma.galleryItem.findMany({
      include: { media: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    }),
  ])
  return (
    <EntryLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson(
            imageGallerySchema(
              items.map((item) => ({
                url: item.media.url,
                caption: item.caption,
                altText: item.media.altText,
              }))
            )
          ),
        }}
      />
      <EntryHeading
        eyebrow="People, places & moments"
        title="Life in pictures"
        description={
          getField(content, 'hero.subtitle') ||
          'A photo album from work, community, and the rest of life.'
        }
      />
      <PhotoCollection items={items} filterable />
    </EntryLayout>
  )
}
