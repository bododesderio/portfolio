import Image from 'next/image'
import { thumbnailUrl, blurUrl } from '@/lib/image-utils'

interface PhotoStripItem {
  id: string
  caption?: string | null
  media: {
    url: string
    altText?: string | null
  }
}

/**
 * Full-bleed horizontal strip of photos. Designed to break up text-heavy sections
 * with a burst of visual energy. No container — edge-to-edge.
 */
export function PhotoStrip({ items }: { items: PhotoStripItem[] }) {
  if (items.length < 2) return null

  return (
    <div className="overflow-hidden py-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {items.slice(0, 6).map((item) => (
          <figure
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <Image
              src={thumbnailUrl(item.media.url, 500)}
              alt={item.media.altText || item.caption || ''}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 33vw, 16vw"
              placeholder="blur"
              blurDataURL={blurUrl(item.media.url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {item.caption && (
              <p className="absolute bottom-2 left-2 right-2 text-[11px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                {item.caption}
              </p>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}
