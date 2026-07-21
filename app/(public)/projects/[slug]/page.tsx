export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/data/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ExternalLink, ArrowLeft, Calendar, Tag } from 'lucide-react'
import { sanitizeHtml } from '@/lib/util/sanitize'
import { FaGithub } from 'react-icons/fa'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findUnique({ where: { slug } })
  if (!project) return {}
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return {
    title: `${project.title} — Bodo Desderio`,
    description: project.excerpt,
    alternates: { canonical: `${baseUrl}/projects/${project.slug}` },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.excerpt,
      url: `${baseUrl}/projects/${project.slug}`,
      images: project.featuredImageUrl ? [{ url: project.featuredImageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.excerpt,
      images: project.featuredImageUrl ? [project.featuredImageUrl] : undefined,
    },
  }
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

function formatDuration(startDate: Date | null, endDate: Date | null, ongoing: boolean): string {
  if (!startDate) return ''
  const start = format(startDate, 'MMM yyyy')
  if (ongoing) return `${start} — Present`
  if (endDate) return `${start} — ${format(endDate, 'MMM yyyy')}`
  return start
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await prisma.project.findFirst({
    where: { slug, visible: true },
    include: { images: { orderBy: { order: 'asc' } } },
  })

  if (!project) notFound()

  const related = await prisma.project.findMany({
    where: {
      visible: true,
      NOT: { id: project.id },
      ...(project.category ? { category: project.category } : {}),
    },
    take: 3,
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  })

  const duration = formatDuration(project.startDate, project.endDate, project.ongoing)

  return (
    <article className="pt-24">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
          {project.category && (
            <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
              {project.category}
            </span>
          )}
          {duration && (
            <span className="flex items-center gap-1.5 text-sm text-fg-muted">
              <Calendar className="h-3.5 w-3.5" />
              {duration}
            </span>
          )}
        </div>

        <h1 className="font-serif text-4xl md:text-6xl text-fg mb-6 leading-tight">
          {project.title}
        </h1>

        <p className="text-xl text-fg-muted leading-relaxed mb-8">
          {project.excerpt}
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View live site
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-ink-200 dark:hover:bg-ink-700 text-fg text-sm font-medium rounded-full transition-colors"
            >
              <FaGithub className="h-4 w-4" />
              Source code
            </a>
          )}
        </div>
      </div>

      {/* Featured image */}
      {project.featuredImageUrl && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative h-64 md:h-[500px] rounded-2xl overflow-hidden">
            <Image src={project.featuredImageUrl} alt={project.featuredImageAlt || project.title} fill sizes="(max-width: 768px) 100vw, 80vw" className="object-cover" priority />
          </div>
        </div>
      )}

      {/* Tech stack */}
      {project.techStack.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-fg-muted" />
            <span className="text-sm font-medium text-fg-muted">Tech Stack</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-muted text-sm text-fg font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-brand"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.body) }}
        />
      </div>

      {/* Gallery */}
      {project.images.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="font-serif text-2xl text-fg mb-6">Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.images.map((img, i) => (
              <div key={img.id} className="relative aspect-[16/10] rounded-xl overflow-hidden">
                <Image
                  src={img.url}
                  alt={img.alt || `${project.title} screenshot ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                {img.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related projects */}
      {related.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="font-serif text-3xl text-fg mb-8">Related projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.id} href={`/projects/${r.slug}`} className="group">
                {r.featuredImageUrl && (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3">
                    <Image src={r.featuredImageUrl} alt={r.featuredImageAlt || r.title} fill sizes="200px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <h3 className="font-serif text-lg text-fg group-hover:text-brand transition-colors mb-1">
                  {r.title}
                </h3>
                <p className="text-fg-muted text-sm line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Link href="/projects" className="inline-flex items-center gap-2 text-brand hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </div>
    </article>
  )
}
