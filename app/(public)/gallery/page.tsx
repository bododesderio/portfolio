import { pageMetadata } from '@/lib/seo/page-metadata'
import { prisma } from '@/lib/data/db'
import { getPageContent, getField } from '@/lib/data/content'
import { ldJson, imageGallerySchema } from '@/lib/schema'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { PhotoCollection } from '@/components/personal/PhotoCollection'
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return pageMetadata({
    page: 'gallery',
    title: "Photographs · Bodo Desderio",
    description:
      "Photographs from tech camps, community outreach, events and time with friends, from the personal archive of Bodo Desderio.",
    path: '/gallery',
  })
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
