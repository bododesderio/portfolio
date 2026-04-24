import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'

interface AboutGalleryItem {
  id: string
  caption?: string | null
  category?: string | null
  media: {
    url: string
    altText?: string | null
  }
}

const TILE_SPANS = [
  'md:col-span-7 md:row-span-2',
  'md:col-span-5 md:row-span-1',
  'md:col-span-3 md:row-span-1',
  'md:col-span-4 md:row-span-1',
  'md:col-span-5 md:row-span-1',
  'md:col-span-4 md:row-span-1',
]

export function AboutGallerySection({ items }: { items: AboutGalleryItem[] }) {
  if (!items.length) return null

  return (
    <Section className="bg-surface-2 border-y border-hairline overflow-hidden" spacing="compact">
      <Container>
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow className="mb-3">In the field</Eyebrow>
            <h2 className="font-serif text-4xl text-fg md:text-5xl">
              The work has a life outside the screen.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-fg-muted">
              A few frames from the classrooms, conversations, community work, and product-building
              moments that shape the story.
            </p>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-600"
          >
            View full gallery
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:auto-rows-[190px] md:grid-cols-12 md:gap-5">
          {items.slice(0, 6).map((item, idx) => (
            <figure
              key={item.id}
              className={`group relative overflow-hidden rounded-[18px] border border-hairline bg-card ${
                TILE_SPANS[idx] ?? 'md:col-span-4 md:row-span-1'
              } ${idx === 0 ? 'col-span-2 aspect-[4/5] md:aspect-auto' : 'aspect-[4/3] md:aspect-auto'}`}
            >
              <Image
                src={item.media.url}
                alt={item.media.altText || item.caption || 'About gallery image'}
                fill
                sizes={
                  idx === 0
                    ? '(max-width: 768px) 100vw, 58vw'
                    : '(max-width: 768px) 50vw, 33vw'
                }
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              {(item.caption || item.category) && (
                <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                  {item.category && (
                    <span className="mb-2 inline-flex rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                  {item.caption && (
                    <p className="max-w-md text-sm leading-relaxed text-white/90 md:text-[15px]">
                      {item.caption}
                    </p>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  )
}
