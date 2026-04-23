'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Quote, Download, Maximize2, X as XIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface PressItem {
  id: string
  type: string
  title: string
  description: string
  source: string
  sourceUrl?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
  externalUrl?: string | null
  downloadUrl?: string | null
  date?: string | null
  order: number
  [key: string]: unknown
}

interface MediumPost {
  title: string
  link: string
  pubDate: string
  excerpt: string
  thumbnail: string | null
}

const EASE = [0.16, 1, 0.3, 1] as const

export function PressSection({ items, mediumPosts = [] }: { items?: PressItem[]; mediumPosts?: MediumPost[] }) {
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null)

  // Fallback to hardcoded essay if no items from DB
  const pressItems: PressItem[] = items && items.length > 0 ? items : [
    {
      id: 'vnsac234',
      type: 'essay',
      title: "Corruption: The Rot That Has Infected Uganda\u2019s Health Sector.",
      description: "Selected contributor to the Virtual National Students\u2019 Anti-Corruption Challenge \u2014 a partnership with the Office of the Auditor General, State House Anti-Corruption Unit, Parliament of Uganda, and German Cooperation (GIZ).",
      source: '@NDCUganda',
      sourceUrl: 'https://x.com/NDCUganda',
      imageUrl: '/images/press/vnsac234-essay.jpg',
      imageAlt: "Essay poster: Corruption \u2014 The Rot That Has Infected Uganda\u2019s Health Sector, by Bodo Desderio, Kampala International University, Year Two. Published as part of the VNSAC234 anti-corruption challenge.",
      externalUrl: 'https://x.com/NDCUganda/status/1790297774686191874',
      downloadUrl: '/images/press/vnsac234-essay.jpg',
      date: '2024',
      order: 0,
    },
  ]

  return (
    <Section className="relative bg-surface-2 border-y border-hairline overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-radial-brand opacity-20" />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <Eyebrow className="mb-4">Press & recognition</Eyebrow>
          <h2 className="font-serif text-h2 text-fg mb-4">
            Writing beyond the page.
          </h2>
          <p className="text-fg-muted">
            Selected essays, articles, speaking engagements, and invitations to contribute to national conversations.
          </p>
        </motion.div>

        <div className="space-y-8">
          {pressItems.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: EASE, delay: idx * 0.1 }}
              className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center rounded-3xl border border-hairline bg-card p-6 md:p-10 shadow-sm"
            >
              {/* Left — quote card */}
              <div>
                <Quote className="h-8 w-8 text-brand mb-5" aria-hidden />
                <p className="text-[10px] uppercase tracking-brand text-fg-muted mb-3">
                  {item.type} {item.source && `· ${item.source}`} {item.date && `· ${item.date}`}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl text-fg leading-tight mb-4">
                  {item.title}
                </h3>
                <p className="text-fg-muted leading-relaxed mb-6">
                  {item.description}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                      {item.type === 'article' ? 'Read article' : 'Read on X'}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  )}
                  {item.downloadUrl && (
                    <a
                      href={item.downloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-hairline bg-muted text-fg text-sm font-medium hover:border-brand/40 transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  )}
                  {item.sourceUrl && (
                    <span className="text-xs text-fg-muted">
                      Credit:{' '}
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-fg-muted hover:text-brand underline decoration-dotted underline-offset-4"
                      >
                        {item.source}
                      </a>
                    </span>
                  )}
                </div>
              </div>

              {/* Right — poster image */}
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: item.imageUrl!, alt: item.imageAlt || item.title })}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-hairline shadow-md cursor-zoom-in"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt || item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    unoptimized
                  />
                  <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-2xl" />
                  <div className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </button>
              )}
            </motion.article>
          ))}
        </div>

        {/* Writing on Medium subsection */}
        {mediumPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mt-16"
          >
            <h3 className="font-serif text-xl md:text-2xl text-fg mb-8 text-center">
              Writing on Medium
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediumPosts.map((post, idx) => (
                <motion.a
                  key={post.link}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.7, ease: EASE, delay: idx * 0.08 }}
                  className="group flex flex-col rounded-2xl border border-hairline bg-card p-5 shadow-sm hover:border-brand/40 hover:shadow-md transition-all"
                >
                  {post.thumbnail && (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-muted">
                      <Image
                        src={post.thumbnail}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        unoptimized
                      />
                    </div>
                  )}
                  {post.pubDate && (
                    <p className="text-[10px] uppercase tracking-brand text-fg-muted mb-2">
                      {new Date(post.pubDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  <h4 className="font-serif text-lg text-fg leading-snug mb-2 group-hover:text-brand transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-sm text-fg-muted leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
                    Read on Medium
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </Container>

      {/* Lightbox preview */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={previewImage.url}
                alt={previewImage.alt}
                width={1200}
                height={1500}
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                unoptimized
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <a
                  href={previewImage.url}
                  download
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                  title="Download"
                >
                  <Download className="h-5 w-5" />
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                  title="Close"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
