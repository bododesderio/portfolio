'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { thumbnailUrl, optimizedUrl, blurUrl } from '@/lib/image-utils'

interface Media {
  id: string
  url: string
  altText?: string | null
}

interface GalleryItem {
  id: string
  media: Media
  caption?: string | null
  category?: string | null
  featured: boolean
}

interface GalleryPageProps {
  items: GalleryItem[]
}

const categories = ['All', 'Tech & Work', 'Community', 'Personal']

export function GalleryPageClient({ items }: GalleryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory)

  const featuredItems = items.filter(item => item.featured)

  return (
    <Section>
      <Container>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Eyebrow className="mb-2">Gallery</Eyebrow>
          <h1 className="font-serif text-5xl md:text-6xl text-fg mb-4">
            Moments & Projects
          </h1>
          <p className="text-lg text-fg-muted max-w-2xl mx-auto">
            A visual journey through tech camps, community events, and behind-the-scenes of the work.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex justify-center gap-4 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured highlight */}
        {selectedCategory === 'All' && featuredItems.length > 0 && (
          <motion.div
            layout
            className="mb-12"
          >
            <h2 className="font-serif text-2xl text-fg mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative h-64 md:h-96 rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <Image
                    src={optimizedUrl(item.media.url, 1200)}
                    alt={item.caption || 'Gallery image'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    placeholder="blur"
                    blurDataURL={blurUrl(item.media.url)}
                  />
                  {item.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white font-medium">{item.caption}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredItems.map(item => {
              // Skip featured if we showed them separately
              if (selectedCategory === 'All' && featuredItems.some(f => f.id === item.id) && item.featured) return null
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <Image
                    src={thumbnailUrl(item.media.url)}
                    alt={item.caption || 'Gallery image'}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={blurUrl(item.media.url)}
                  />
                  {item.caption && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                  {item.category && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-brand transition-colors"
                onClick={() => setSelectedItem(null)}
              >
                <X className="h-8 w-8" />
              </button>
              <div className="relative max-w-5xl w-full h-[80vh]">
                <Image
                  src={optimizedUrl(selectedItem.media.url)}
                  alt={selectedItem.caption || 'Gallery image'}
                  fill
                  className="object-contain"
                  placeholder="blur"
                  blurDataURL={blurUrl(selectedItem.media.url)}
                  sizes="90vw"
                />
                {selectedItem.caption && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                    <p>{selectedItem.caption}</p>
                    {selectedItem.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded text-xs">
                        {selectedItem.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Section>
  )
}
