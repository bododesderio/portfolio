import { prisma } from '@/lib/data/db'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { Pagination } from '@/components/admin/Pagination'
import { Layers, Plus, ImageIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { DeleteProjectButton } from './DeleteProjectButton'

export const metadata: Metadata = { title: 'Projects — Admin' }
export const dynamic = 'force-dynamic'

const statusColors: Record<string, string> = {
  planned: 'bg-blue-500/90',
  in_progress: 'bg-amber-500/90',
  completed: 'bg-emerald-500/90',
}

const statusLabels: Record<string, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  completed: 'Completed',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      include: { images: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
    }),
    prisma.project.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const visible = projects.filter(p => p.visible).length
  const featured = projects.filter(p => p.featured).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminPageHeader
          title="Projects"
          description={`${total} total · ${visible} visible · ${featured} featured`}
        />
        <Link
          href="/admin/projects/new"
          className="px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      {projects.length === 0 && page === 1 ? (
        <div className="rounded-2xl border border-hairline bg-card p-16 text-center">
          <Layers className="h-10 w-10 text-fg-muted mx-auto mb-4" />
          <p className="text-fg-muted mb-4">No projects yet. Showcase your first project.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-600 text-white text-sm font-medium rounded-full transition-colors"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(project => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="group bg-card rounded-2xl border border-hairline overflow-hidden hover:border-brand/30 transition-colors flex flex-col"
              >
                <div className="relative h-40 bg-muted overflow-hidden">
                  {project.featuredImageUrl ? (
                    <Image
                      src={project.featuredImageUrl}
                      alt={project.featuredImageAlt || project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-fg-muted/40" />
                    </div>
                  )}
                  <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-medium backdrop-blur-sm text-white ${statusColors[project.status] ?? 'bg-gray-500/90'}`}>
                    {statusLabels[project.status] ?? project.status}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-medium text-fg line-clamp-1 group-hover:text-brand transition-colors">{project.title}</h3>
                  <p className="text-xs text-fg-muted mt-0.5 mb-2">/projects/{project.slug}</p>

                  {project.excerpt && (
                    <p className="text-sm text-fg-muted line-clamp-2 mb-3 flex-1">{project.excerpt}</p>
                  )}

                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.techStack.slice(0, 5).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-muted text-xs text-fg-muted">{tag}</span>
                      ))}
                      {project.techStack.length > 5 && (
                        <span className="px-2 py-0.5 rounded bg-muted text-xs text-fg-muted">+{project.techStack.length - 5}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-hairline">
                    <div className="flex items-center gap-3 text-xs text-fg-muted">
                      {project.category && (
                        <span className="px-2 py-0.5 rounded bg-muted">{project.category}</span>
                      )}
                      <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    <DeleteProjectButton id={project.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/projects" />
        </>
      )}
    </div>
  )
}
