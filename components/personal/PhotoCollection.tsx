'use client'
import { useId, useState } from 'react'
import Image from 'next/image'
export type PersonalPhoto = {
  id: string
  caption: string | null
  category?: string | null
  media: { url: string; altText: string | null }
}
// Seeded media rows used the file name as alt text, which screen readers then read aloud.
function describePhoto(photo: PersonalPhoto, fallback: string) {
  const altText = photo.media.altText?.trim()
  const isFileName =
    !altText || /\.(jpe?g|png|webp|gif|avif)$/i.test(altText)
  return (isFileName ? '' : altText) || photo.caption || fallback
}
/** Photo grid; each photo opens in the site-wide viewer with the rest of this collection. */
export function PhotoCollection({
  items,
  filterable = false,
}: {
  items: PersonalPhoto[]
  filterable?: boolean
}) {
  const [category, setCategory] = useState('All')
  const group = `photos-${useId()}`
  const categories = [
    'All',
    ...Array.from(
      new Set(
        items
          .map((item) => item.category)
          .filter((value): value is string => Boolean(value))
      )
    ),
  ]
  const visible =
    category === 'All'
      ? items
      : items.filter((item) => item.category === category)
  return (
    <>
      {filterable && (
        <div
          className="personal-filter-list"
          role="group"
          aria-label="Filter photographs"
        >
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <div
        className={`personal-photo-grid ${filterable ? 'personal-photo-grid-full' : ''}`}
      >
        {visible.map((item, index) => {
          const description = describePhoto(item, 'Photograph from Bodo’s archive')
          return (
            <figure key={item.id}>
              <button
                type="button"
                className="personal-photo-button"
                data-lightbox={group}
                data-lightbox-src={item.media.url}
                data-lightbox-alt={item.caption || description}
                aria-label={`Open photograph: ${describePhoto(item, String(index + 1))}`}
              >
                <Image
                  src={item.media.url}
                  alt={description}
                  fill
                  sizes="(max-width: 700px) 85vw, (max-width: 1100px) 40vw, 320px"
                  className="object-cover"
                />
              </button>
              {item.caption && <figcaption>{item.caption}</figcaption>}
            </figure>
          )
        })}
      </div>
      {visible.length === 0 && (
        <p className="personal-empty">No photographs in this collection yet.</p>
      )}
    </>
  )
}
