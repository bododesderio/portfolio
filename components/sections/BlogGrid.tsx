'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { Container } from '@/components/ui/Container'

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImageUrl: string
  featuredImageAlt: string
  category: string | null
  publishedAt: Date | null
}

const PAGE_SIZE = 6

export function BlogGrid({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[]
    return ['All', ...cats]
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory
      const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [posts, query, activeCategory])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(cat: string) {
    setActiveCategory(cat)
    setPage(1)
  }

  function handleSearch(val: string) {
    setQuery(val)
    setPage(1)
  }

  return (
    <section className="py-16">
      <Container>
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="search"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-hairline rounded-full text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-brand text-white'
                    : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {paginated.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-ink-500 py-16"
            >
              No posts found.
            </motion.p>
          ) : (
            <motion.div
              key={`${activeCategory}-${query}-${page}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {paginated.map(post => (
                <article
                  key={post.id}
                  className="flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {post.featuredImageUrl && (
                    <div className="relative h-48 w-full">
                      <Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                          {post.category}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="text-xs text-ink-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-xl text-fg mb-2">{post.title}</h3>
                    <p className="text-fg-muted text-sm line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="text-brand hover:underline font-medium text-sm">
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                  page === n
                    ? 'bg-brand text-white'
                    : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </Container>
    </section>
  )
}
