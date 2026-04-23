export const dynamic = 'force-dynamic'

import { getPageContent, getField } from '@/lib/content'
import { prisma } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'
import { BlogGrid } from '@/components/sections/BlogGrid'
import { NewsletterForm } from '@/components/layout/NewsletterForm'
import { ldJson, blogIndexSchema } from '@/lib/schema'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Bodo Desderio',
  description: 'Thoughts on tech, business & building in Africa.',
}

export default async function BlogPage() {
  const content = await getPageContent('blog')

  const hero = {
    title: getField(content, 'hero.heading') || 'Blog',
    subtitle: getField(content, 'hero.subtitle') || '',
    image: getField(content, 'hero.image') || '/images/stock/blog-hero.svg',
  }

  const featuredPost = await prisma.blogPost.findFirst({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })

  const allPosts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(blogIndexSchema(allPosts.map(p => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, publishedAt: p.publishedAt, category: p.category })))) }}
      />
      <section className="relative h-[50vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={hero.image} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="font-serif text-5xl md:text-6xl text-white mb-4">{hero.title}</h1>
          {hero.subtitle && (
            <p className="text-xl text-white/90 max-w-2xl mx-auto">{hero.subtitle}</p>
          )}
        </div>
      </section>

      {featuredPost && (
        <section className="py-16 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-brand text-sm uppercase tracking-widest">Featured</p>
            </div>
            <article className="grid md:grid-cols-2 gap-8 items-center">
              {featuredPost.featuredImageUrl && (
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
                  <Image src={featuredPost.featuredImageUrl} alt={featuredPost.featuredImageAlt} fill className="object-cover" />
                </div>
              )}
              <div>
                {featuredPost.category && (
                  <span className="px-2 py-1 bg-brand/10 text-brand text-sm rounded-full">
                    {featuredPost.category}
                  </span>
                )}
                <h2 className="font-serif text-4xl text-slate-900 dark:text-white my-4">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mb-4">
                  {featuredPost.excerpt}
                </p>
                <Link href={`/blog/${featuredPost.slug}`} className="inline-flex items-center text-brand hover:underline font-medium">
                  Read article →
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="py-16">
        <BlogGrid posts={allPosts} />
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="font-serif text-3xl text-slate-900 dark:text-white mb-4">Stay in the loop</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Get notified when I publish new articles directly to your inbox.
          </p>
          <div className="flex justify-center">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  )
}
