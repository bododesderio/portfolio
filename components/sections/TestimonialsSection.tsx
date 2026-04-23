'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Quote } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface Media {
  url: string
  altText?: string | null
}

interface Testimonial {
  id: string
  body: string
  author: string
  role: string
  company?: string | null
  photo: Media | null
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <Section className="bg-slate-50 dark:bg-slate-900">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Eyebrow className="mb-2">Testimonials</Eyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">
            What people say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm relative"
            >
              <Quote className="absolute w-10 h-10 text-brand/20 top-4 left-4" />
              <div className="flex items-center mb-6">
                {t.photo && (
                  <Image src={t.photo.url} alt={t.author} width={48} height={48} className="rounded-full mr-4" />
                )}
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.author}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {t.role}{t.company && `, ${t.company}`}
                  </p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
                “{t.body}”
              </p>
            </motion.blockquote>
          ))}
        </div>
      </Container>
    </Section>
  )
}
