'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: string | null
  category?: string | null
  publishedAt?: Date | null
}

interface BlogSectionProps {
  posts: BlogPost[]
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <Section>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Eyebrow className="mb-2">Writing</Eyebrow>
          <h2 className="font-serif text-4xl md:text-5xl text-slate-900 dark:text-white">
            Thoughts on tech, business & building in Africa.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {post.featuredImage && (
                <div className="relative h-48 w-full">
                  <Image src={post.featuredImage} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {post.category && (
                    <span className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="text-xs text-slate-500">
                      {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 flex-1">
                  {post.excerpt}
                </p>
                <Link href={`/blog/${post.slug}`} className="text-brand hover:underline font-medium text-sm">
                  Read more →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/blog" className="text-brand hover:underline font-medium">
            View all posts
          </Link>
        </div>
      </Container>
    </Section>
  )
}
