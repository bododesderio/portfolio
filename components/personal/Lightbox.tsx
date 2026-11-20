'use client'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type Slide = { src: string; alt: string }

/** Wraps an image so a click or Enter opens it, with the rest of its group, in the lightbox. */
export function Zoomable({
  group,
  src,
  alt,
  className,
  children,
}: {
  group: string
  src: string
  alt: string
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={['personal-zoom', className].filter(Boolean).join(' ')}
      data-lightbox={group}
      data-lightbox-src={src}
      data-lightbox-alt={alt}
      aria-label={`View ${alt} full size`}
    >
      {children}
    </button>
  )
}

function slidesFor(trigger: HTMLElement): { slides: Slide[]; index: number } {
  const group = trigger.dataset.lightbox
  if (group) {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-lightbox]')).filter(
      (node) => node.dataset.lightbox === group,
    )
    return {
      slides: nodes.map((node) => ({
        src: node.dataset.lightboxSrc ?? '',
        alt: node.dataset.lightboxAlt ?? '',
      })),
      index: Math.max(0, nodes.indexOf(trigger)),
    }
  }
  // Images inside article and biography text share one group per text block.
  const images = Array.from(trigger.closest('.personal-prose')?.querySelectorAll('img') ?? [])
  return {
    slides: images.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt })),
    index: Math.max(0, images.indexOf(trigger as HTMLImageElement)),
  }
}

/** One viewer for every image on the public site; mounted once in the public layout. */
export function Lightbox() {
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const touchStart = useRef<number | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [index, setIndex] = useState(0)

  const step = useCallback(
    (by: number) => setIndex((current) => (slides.length ? (current + by + slides.length) % slides.length : 0)),
    [slides.length],
  )

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      const trigger = target?.closest<HTMLElement>('[data-lightbox], .personal-prose img')
      if (!trigger || trigger.closest('a')) return
      event.preventDefault()
      const next = slidesFor(trigger)
      if (!next.slides.length) return
      opener.current = trigger
      setSlides(next.slides)
      setIndex(next.index)
      dialog.current?.showModal()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function close() {
    dialog.current?.close()
  }

  const active = slides[index]
  const many = slides.length > 1

  return (
    <dialog
      ref={dialog}
      className="personal-viewer"
      aria-label="Image viewer"
      onClose={() => {
        setSlides([])
        opener.current?.focus()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') step(1)
        if (event.key === 'ArrowLeft') step(-1)
      }}
      onTouchStart={(event) => {
        touchStart.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current
        const end = event.changedTouches[0]?.clientX
        touchStart.current = null
        if (start !== null && end !== undefined && Math.abs(end - start) > 48) step(end < start ? 1 : -1)
      }}
    >
      {active && (
        <figure className="personal-viewer-figure">
          {/* eslint-disable-next-line @next/next/no-img-element -- the original file is shown at its own size */}
          <img src={active.src} alt={active.alt} />
          {(active.alt || many) && (
            <figcaption>
              {active.alt && <span>{active.alt}</span>}
              {many && (
                <span className="personal-viewer-count">
                  {index + 1} / {slides.length}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      )}
      <button type="button" className="personal-viewer-close" onClick={close} aria-label="Close image viewer">
        <X size={22} aria-hidden="true" />
      </button>
      {many && (
        <>
          <button
            type="button"
            className="personal-viewer-step personal-viewer-prev"
            onClick={() => step(-1)}
            aria-label="Previous image"
          >
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="personal-viewer-step personal-viewer-next"
            onClick={() => step(1)}
            aria-label="Next image"
          >
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        </>
      )}
    </dialog>
  )
}
