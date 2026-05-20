'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ExternalLink } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { Container } from '@/components/ui/Container'

interface Project {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImageUrl: string | null
  featuredImageAlt: string | null
  status: string
  category: string | null
  techStack: string[]
  liveUrl: string | null
  githubUrl: string | null
  startDate: Date | string | null
  endDate: Date | string | null
  ongoing: boolean
}

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
}

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'planned', label: 'Planned' },
]

function formatDuration(startDate: Date | string | null, endDate: Date | string | null, ongoing: boolean): string {
  if (!startDate) return ''
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  if (ongoing) return `${start} — Present`
  if (endDate) {
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    return `${start} — ${end}`
  }
  return start
}

const PAGE_SIZE = 9

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesStatus = activeFilter === 'all' || p.status === activeFilter
      const matchesQuery = !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        p.techStack.some(t => t.toLowerCase().includes(query.toLowerCase()))
      return matchesStatus && matchesQuery
    })
  }, [projects, query, activeFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilter(val: string) {
    setActiveFilter(val)
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
              placeholder="Search projects…"
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-hairline rounded-full text-fg placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => handleFilter(tab.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === tab.value
                    ? 'bg-brand text-white'
                    : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}
              >
                {tab.label}
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
              No projects found.
            </motion.p>
          ) : (
            <motion.div
              key={`${activeFilter}-${query}-${page}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {paginated.map(project => (
                <article
                  key={project.id}
                  className="group flex flex-col bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      {project.featuredImageUrl ? (
                        <Image
                          src={project.featuredImageUrl}
                          alt={project.featuredImageAlt || project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/10 to-brand/5">
                          <span className="font-serif text-2xl text-brand/40">{project.title[0]}</span>
                        </div>
                      )}
                      <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[project.status] ?? project.status}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {project.category && (
                        <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                          {project.category}
                        </span>
                      )}
                      {(project.startDate || project.ongoing) && (
                        <span className="text-xs text-ink-500">
                          {formatDuration(project.startDate, project.endDate, project.ongoing)}
                        </span>
                      )}
                    </div>

                    <Link href={`/projects/${project.slug}`}>
                      <h3 className="font-serif text-xl text-fg mb-2 group-hover:text-brand transition-colors">{project.title}</h3>
                    </Link>
                    <p className="text-fg-muted text-sm line-clamp-3 mb-4 flex-1">{project.excerpt}</p>

                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.slice(0, 4).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-fg-muted font-medium">{tag}</span>
                        ))}
                        {project.techStack.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-[11px] text-fg-muted font-medium">+{project.techStack.length - 4}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t border-hairline">
                      <Link href={`/projects/${project.slug}`} className="text-brand hover:underline font-medium text-sm">
                        View details →
                      </Link>
                      <div className="flex-1" />
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-fg-muted hover:text-brand transition-colors" title="Live site">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-fg-muted hover:text-brand transition-colors" title="GitHub">
                          <FaGithub className="h-4 w-4" />
                        </a>
                      )}
                    </div>
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
                  page === n ? 'bg-brand text-white' : 'bg-muted text-fg-muted hover:bg-ink-200 dark:hover:bg-ink-700'
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
