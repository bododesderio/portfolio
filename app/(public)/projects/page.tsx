import { pageMetadata } from '@/lib/seo/page-metadata'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/data/db'
import { EntryHeading, EntryLayout } from '@/components/personal/EntryLayout'
import { PersonalIcon } from '@/components/personal/PersonalIcon'
export const dynamic = 'force-dynamic'
export function generateMetadata() {
  return pageMetadata({
    page: 'projects',
    title: "Work & ventures · Bodo Desderio",
    description:
      "The companies, software and ventures Bodo Desderio has built or worked on, including Rooibok Technologies and Kakebe Technologies.",
    path: '/projects',
  })
}
const statuses: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  planned: 'On the horizon',
}
export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status =
    typeof params.status === 'string' &&
    ['completed', 'in_progress', 'planned'].includes(params.status)
      ? params.status
      : 'all'
  const projects = await prisma.project.findMany({
    where: { visible: true, ...(status !== 'all' ? { status } : {}) },
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { images: true } } },
  })
  return (
    <EntryLayout>
      <EntryHeading
        eyebrow="The things I put my time into"
        title="Work & ventures"
        description="Companies, software, and projects. Some finished, some still unfolding."
      />
      <nav className="personal-filter-list" aria-label="Filter work">
        {[
          { value: 'all', label: 'Everything' },
          { value: 'in_progress', label: 'In progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'planned', label: 'On the horizon' },
        ].map((item) => (
          <Link
            key={item.value}
            href={
              item.value === 'all'
                ? '/projects'
                : `/projects?status=${item.value}`
            }
            aria-current={status === item.value ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="personal-project-grid">
        {projects.map((project) => (
          <article key={project.id} className="personal-project-entry">
            <Link
              href={`/projects/${project.slug}`}
              className={`personal-project-cover ${project.featuredImageUrl ? '' : 'is-placeholder'}`}
            >
              {project.featuredImageUrl ? (
                <Image
                  src={project.featuredImageUrl}
                  alt={project.featuredImageAlt || project.title}
                  fill
                  sizes="(max-width: 760px) 90vw, 48vw"
                  className="object-cover"
                />
              ) : (
                <div className="personal-project-type">
                  <PersonalIcon name="work" />
                </div>
              )}
              <span className="personal-project-state">
                {statuses[project.status] || project.status}
              </span>
            </Link>
            <div className="personal-project-copy">
              <p className="personal-meta">
                {[project.category, project.startDate?.getUTCFullYear()]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <h2>
                <Link href={`/projects/${project.slug}`}>{project.title}</Link>
              </h2>
              <p>{project.excerpt}</p>
              {project.techStack.length > 0 && (
                <p className="personal-project-technologies">
                  {project.techStack.slice(0, 5).join(' · ')}
                </p>
              )}
              <Link
                className="personal-inline-link"
                href={`/projects/${project.slug}`}
              >
                Explore the project <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="personal-empty">No projects in this collection yet.</p>
      )}
    </EntryLayout>
  )
}
