'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { thumbnailUrl, blurUrl, optimizedUrl } from '@/lib/util/image-utils'

interface PhotoStripItem {
  id: string
  caption?: string | null
  media: {
    url: string
    altText?: string | null
  }
}

/**
 * Infinite-scroll marquee strip of photos with lightbox preview.
 * Edge-to-edge, no container. Duplicates items for seamless loop.
 */
export function PhotoStrip({ items, reverse = false }: { items: PhotoStripItem[]; reverse?: boolean }) {
  const [selected, setSelected] = useState<PhotoStripItem | null>(null)

  if (items.length < 2) return null

  // Duplicate for seamless loop
  const display = [...items, ...items]

  return (
    <>
      <div className="overflow-hidden py-4 select-none">
        <div
          className={`flex gap-3 w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
          style={{ willChange: 'transform' }}
        >
          {display.map((item, i) => (
            <figure
              key={`${item.id}-${i}`}
              className="group relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setSelected(item)}
            >
              <Image
                src={thumbnailUrl(item.media.url, 500)}
                alt={item.media.altText || item.caption || ''}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 192px, 256px"
                placeholder="blur"
                blurDataURL={blurUrl(item.media.url)}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {item.caption && (
                <p className="absolute bottom-2 left-2 right-2 text-xs text-white/90 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-1">
                  {item.caption}
                </p>
              )}
            </figure>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-brand transition-colors z-10"
              onClick={() => setSelected(null)}
            >
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full h-[75vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={optimizedUrl(selected.media.url)}
                alt={selected.media.altText || selected.caption || ''}
                fill
                className="object-contain"
                sizes="90vw"
              />
              {selected.caption && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg text-sm">
                  {selected.caption}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
