import { Zoomable } from '@/components/personal/Lightbox'
import { pageMetadata } from '@/lib/seo/page-metadata'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/data/db'
import {
  EntryHeading,
  EntryLayout,
  EntrySection,
} from '@/components/personal/EntryLayout'
import { RichText, WorkRows } from '@/components/personal/ProfileContent'
import { PhotoCollection } from '@/components/personal/PhotoCollection'
import { safePublicHref } from '@/lib/domain/profile'
export const dynamic = 'force-dynamic'
interface Props {
  params: Promise<{ slug: string }>
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await prisma.project.findFirst({
    where: { slug, visible: true },
  })
  if (!project) return {}
  return pageMetadata({
    title: `${project.title} · Bodo Desderio`,
    description: project.excerpt,
    path: `/projects/${project.slug}`,
    type: 'article',
    image: project.featuredImageUrl,
  })
}
const statuses: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  planned: 'Planned',
}
function month(date: Date) {
  return date.toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await prisma.project.findFirst({
    where: { slug, visible: true },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!project) notFound()
  const related = await prisma.project.findMany({
    where: { visible: true, id: { not: project.id } },
    take: 2,
    orderBy: [{ order: 'asc' }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      status: true,
      category: true,
    },
  })
  const liveUrl = safePublicHref(project.liveUrl || '')
  const githubUrl = safePublicHref(project.githubUrl || '')
  return (
    <EntryLayout
      contents={[
        { id: 'overview', label: 'Overview' },
        ...(project.images.length
          ? [{ id: 'images', label: 'Photographs & images' }]
          : []),
        ...(related.length ? [{ id: 'related', label: 'Other work' }] : []),
      ]}
    >
      <Link href="/projects" className="personal-inline-link">
        ← Back to work
      </Link>
      <EntryHeading
        eyebrow={project.category || 'From the work archive'}
        title={project.title}
        description={project.excerpt}
      />
      <dl className="personal-detail-facts">
        <div>
          <dt>Status</dt>
          <dd>{statuses[project.status] || project.status}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>
            {project.startDate
              ? `${month(project.startDate)}${project.ongoing ? ' – Present' : project.endDate ? ` – ${month(project.endDate)}` : ''}`
              : project.ongoing
                ? 'Ongoing'
                : 'Undated'}
          </dd>
        </div>
        <div>
          <dt>Tools & technologies</dt>
          <dd>{project.techStack.join(' · ') || 'Not listed'}</dd>
        </div>
      </dl>
      {project.featuredImageUrl && (
        <figure className="personal-detail-image">
          <Zoomable
            group="project"
            src={project.featuredImageUrl}
            alt={project.featuredImageAlt || project.title}
          >
            <Image
              src={project.featuredImageUrl}
              alt={project.featuredImageAlt || project.title}
              fill
              sizes="(max-width: 760px) 90vw, 850px"
              className="object-cover"
              priority
            />
          </Zoomable>
        </figure>
      )}
      <EntrySection id="overview" title="About the work">
        <RichText html={project.body} />
        <div className="personal-detail-actions">
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer">
              Visit the website ↗
            </a>
          )}
          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              Explore the source ↗
            </a>
          )}
        </div>
      </EntrySection>
      {project.images.length > 0 && (
        <EntrySection id="images" title="From the project">
          <PhotoCollection
            items={project.images.map((image) => ({
              id: image.id,
              caption: image.caption,
              media: { url: image.url, altText: image.alt },
            }))}
          />
        </EntrySection>
      )}
      {related.length > 0 && (
        <EntrySection id="related" title="Other work">
          <WorkRows items={related} />
        </EntrySection>
      )}
    </EntryLayout>
  )
}
