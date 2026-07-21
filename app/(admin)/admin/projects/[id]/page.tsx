import { prisma } from '@/lib/data/db'
import { notFound } from 'next/navigation'
import { ProjectEditor } from '@/components/admin/ProjectEditor'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Edit Project — Admin' }

interface Props { params: Promise<{ id: string }> }

export default async function ProjectEditorPage({ params }: Props) {
  const { id } = await params
  const isNew = id === 'new'
  const project = isNew
    ? null
    : await prisma.project.findUnique({
        where: { id },
        include: { images: { orderBy: { order: 'asc' } } },
      }).catch(() => null)

  if (!isNew && !project) notFound()

  return (
    <div>
      <AdminPageHeader
        title={isNew ? 'New Project' : 'Edit Project'}
        description={isNew ? 'Add a new project to your portfolio.' : 'Update project details.'}
      />
      <ProjectEditor project={project} />
    </div>
  )
}
