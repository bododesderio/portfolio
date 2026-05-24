export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { ProjectGrid } from '@/components/sections/ProjectGrid'
import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'

export const metadata: Metadata = {
  title: 'Projects — Bodo Desderio',
  description: 'A showcase of projects I have worked on, am currently building, or am planning.',
  alternates: { canonical: `${SITE_URL}/projects` },
  openGraph: {
    title: 'Projects — Bodo Desderio',
    description: 'A showcase of projects I have worked on, am currently building, or am planning.',
    url: '/projects',
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image` }],
  },
  twitter: { card: 'summary_large_image', images: [`${SITE_URL}/opengraph-image`] },
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { visible: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  }).catch(() => [])

  return (
    <>
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-surface to-surface" />
          <div className="absolute inset-0 bg-grid-dark bg-grid-md opacity-[0.04] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,black,transparent_70%)]" />
        </div>
        <div className="relative z-10 text-center px-4">
          <p className="text-[11px] uppercase tracking-brand text-brand mb-4">Portfolio</p>
          <h1 className="font-serif text-5xl md:text-6xl text-fg mb-4">Projects</h1>
          <p className="text-xl text-fg-muted max-w-2xl mx-auto">
            Things I&apos;ve built, am building, or plan to build.
          </p>
        </div>
      </section>

      <ProjectGrid projects={projects} />
    </>
  )
}
