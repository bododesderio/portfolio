import { prisma } from '@/lib/data/db'
import type { Prisma } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Plus, Layers } from 'lucide-react'
import { DeleteProjectButton } from './DeleteProjectButton'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { CollectionToolbar } from '@/components/admin/CollectionToolbar'
export const metadata: Metadata = { title: 'Work · Studio' }
export const dynamic = 'force-dynamic'
const labels: Record<string, string> = {
  in_progress: 'In progress',
  planned: 'Planned',
  completed: 'Completed',
}
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const params = await searchParams
  const query =
    typeof params.q === 'string' ? params.q.trim().slice(0, 120) : ''
  const status = ['visible', 'hidden', 'featured'].includes(params.status || '')
    ? params.status!
    : 'all'
  const where: Prisma.ProjectWhereInput = {
    ...(status === 'visible'
      ? { visible: true }
      : status === 'hidden'
        ? { visible: false }
        : status === 'featured'
          ? { featured: true }
          : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
  const [total, all, visible, featured] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.count(),
    prisma.project.count({ where: { visible: true } }),
    prisma.project.count({ where: { featured: true } }),
  ])
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(
    totalPages,
    Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  )
  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ order: 'asc' }, { updatedAt: 'desc' }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      title: true,
      category: true,
      slug: true,
      visible: true,
      featured: true,
      status: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      updatedAt: true,
    },
  })
  const base = new URLSearchParams()
  if (query) base.set('q', query)
  if (status !== 'all') base.set('status', status)
  return (
    <div>
      <AdminPageHeader
        title="Work & ventures"
        description="The things you build, lead, and put your time into."
        actions={
          <Link href="/admin/projects/new" className="admin-primary-button">
            <Plus size={16} />
            Add work
          </Link>
        }
      />
      <CollectionToolbar
        basePath="/admin/projects"
        query={query}
        status={status}
        label="Work"
        filters={[
          { value: 'all', label: 'Everything', count: all },
          { value: 'visible', label: 'Public', count: visible },
          { value: 'hidden', label: 'Hidden', count: all - visible },
          { value: 'featured', label: 'Featured', count: featured },
        ]}
      />
      <div className="admin-panel">
        {projects.length ? (
          projects.map((project) => (
            <article key={project.id} className="admin-collection-row">
              <Link
                href={`/admin/projects/${project.id}`}
                className="admin-collection-entry"
              >
                <span className="admin-collection-thumb">
                  {project.featuredImageUrl ? (
                    <Image
                      src={project.featuredImageUrl}
                      alt={project.featuredImageAlt || ''}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <Layers size={20} />
                  )}
                </span>
                <div>
                  <h2>{project.title}</h2>
                  <p>
                    {project.category || 'Project'} ·{' '}
                    {labels[project.status] || project.status}
                    {project.featured ? ' · Featured' : ''}
                  </p>
                </div>
              </Link>
              <span
                className="admin-status"
                data-status={project.visible ? 'visible' : 'hidden'}
              >
                {project.visible ? 'Public' : 'Hidden'}
              </span>
              <time
                className="admin-collection-date"
                dateTime={project.updatedAt.toISOString()}
              >
                {project.updatedAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
              </time>
              <div>
                <DeleteProjectButton id={project.id} />
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty">
            <Layers size={25} className="mx-auto mb-3" />
            <p>
              {query || status !== 'all'
                ? 'No work matches these filters.'
                : 'Your work has a story. Add the first chapter.'}
            </p>
            <Link
              href={all ? '/admin/projects' : '/admin/projects/new'}
              className="text-brand inline-block mt-3"
            >
              {all ? 'Clear filters' : 'Add your first project'} ↗
            </Link>
          </div>
        )}
      </div>
      <p className="admin-results-count">
        {total} {total === 1 ? 'entry' : 'entries'}
        {query ? ' matching your search' : ''}
      </p>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={`/admin/projects${base.size ? `?${base}` : ''}`}
      />
    </div>
  )
}
