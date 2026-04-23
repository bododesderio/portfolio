import { prisma } from '@/lib/db'
import { MediaLibrary } from '@/components/admin/MediaLibrary'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Media — Admin' }

export default async function MediaPage() {
  const media = await prisma.media.findMany({
    orderBy: { uploadedAt: 'desc' },
    include: {
      galleryItems: {
        select: { id: true, caption: true, category: true, featured: true },
      },
    },
  })
  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Media Library</h1>
      <MediaLibrary initialMedia={media} />
    </div>
  )
}
