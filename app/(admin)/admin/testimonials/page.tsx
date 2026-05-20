import { prisma } from '@/lib/db'
import { TestimonialsManager } from '@/components/admin/TestimonialsManager'
import { Pagination } from '@/components/admin/Pagination'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Testimonials — Admin' }

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function TestimonialsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1', 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: { order: 'asc' },
      include: { photo: true },
      skip,
      take: pageSize,
    }),
    prisma.testimonial.count(),
  ])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Testimonials</h1>
      <TestimonialsManager initialTestimonials={testimonials} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/testimonials" />
    </div>
  )
}
