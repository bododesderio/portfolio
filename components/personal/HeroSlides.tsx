'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export type HeroSlide = {
  src: string
  /** A cut-out portrait keeps its whole figure; a photograph is cropped to fill the frame. */
  kind: 'portrait' | 'photo'
}

const INTERVAL_MS = 3500

/** Cross-fades the hero backdrop. Still for reduced motion, paused in hidden tabs. */
export function HeroSlides({ slides, alt }: { slides: HeroSlide[]; alt: string }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <>
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className="personal-hero-figure"
          data-kind={slide.kind}
          data-active={index === active || undefined}
          aria-hidden={index === active ? undefined : true}
        >
          <Image
            src={slide.src}
            alt={index === 0 ? alt : ''}
            fill
            priority={index === 0}
            sizes="(max-width: 760px) 100vw, 50vw"
            className={slide.kind === 'portrait' ? 'object-contain object-bottom' : 'object-cover'}
          />
        </div>
      ))}
    </>
  )
}
