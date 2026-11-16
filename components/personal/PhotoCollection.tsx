'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
export type PersonalPhoto = {
  id: string
  caption: string | null
  category?: string | null
  media: { url: string; altText: string | null }
}
export function PhotoCollection({
  items,
  filterable = false,
}: {
  items: PersonalPhoto[]
  filterable?: boolean
}) {
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
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
  const active = selected === null ? null : visible[selected]
  useEffect(() => {
    if (active && !dialog.current?.open) dialog.current?.showModal()
  }, [active])
  function close() {
    dialog.current?.close()
    setSelected(null)
    opener.current?.focus()
  }
  function step(direction: number) {
    setSelected((current) =>
      current === null
        ? null
        : (current + direction + visible.length) % visible.length
    )
  }
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
        {visible.map((item, index) => (
          <figure key={item.id}>
            <button
              type="button"
              className="personal-photo-button"
              onClick={(event) => {
                opener.current = event.currentTarget
                setSelected(index)
              }}
              aria-label={`Open photograph: ${item.caption || item.media.altText || index + 1}`}
            >
              <Image
                src={item.media.url}
                alt={
                  item.media.altText ||
                  item.caption ||
                  'Photograph from Bodo’s personal archive'
                }
                fill
                sizes="(max-width: 700px) 85vw, (max-width: 1100px) 40vw, 320px"
                className="object-cover"
              />
            </button>
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="personal-empty">No photographs in this collection yet.</p>
      )}
      <dialog
        ref={dialog}
        className="personal-lightbox"
        onClose={() => {
          setSelected(null)
          opener.current?.focus()
        }}
        onCancel={() => {
          setSelected(null)
          opener.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            step(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            step(1)
          }
        }}
        aria-label="Photograph viewer"
      >
        {active && (
          <div className="personal-lightbox-inner">
            <div className="personal-lightbox-toolbar">
              <span>
                {(selected ?? 0) + 1} / {visible.length}
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close photograph"
              >
                <X size={20} />
              </button>
            </div>
            <div className="personal-lightbox-image">
              <Image
                src={active.media.url}
                alt={
                  active.media.altText ||
                  active.caption ||
                  'Photograph from Bodo’s archive'
                }
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <div className="personal-lightbox-caption">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photograph"
              >
                <ArrowLeft size={20} />
              </button>
              <p>{active.caption || active.media.altText}</p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photograph"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
