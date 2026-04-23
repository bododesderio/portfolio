import { prisma } from '@/lib/db'
import { TestimonialsManager } from '@/components/admin/TestimonialsManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Testimonials — Admin' }

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: 'asc' },
    include: { photo: true },
  })
  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-8">Testimonials</h1>
      <TestimonialsManager initialTestimonials={testimonials} />
    </div>
  )
}
