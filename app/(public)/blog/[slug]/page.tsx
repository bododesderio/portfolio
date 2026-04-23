export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({ where: { slug } })
  if (!post) return {}
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  return {
    title: `${post.title} — Bodo Desderio`,
    description: post.excerpt,
    alternates: { canonical: `${baseUrl}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${post.slug}`,
      images: post.featuredImageUrl ? [{ url: post.featuredImageUrl }] : undefined,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['Bodo Desderio'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'published' },
  })

  if (!post) notFound()

  const related = await prisma.blogPost.findMany({
    where: { status: 'published', category: post.category, NOT: { id: post.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
  const postUrl = `${baseUrl}/blog/${post.slug}`

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    datePublished: (post.publishedAt ?? post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Bodo Desderio',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Bodo Desderio',
      url: baseUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    keywords: post.tags.join(', '),
    articleSection: post.category ?? undefined,
  }

  const attribution = post.featuredImageAttribution as { photographer?: string; source?: string; source_url?: string } | null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  return (
    <article className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Post hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-6 flex items-center gap-3">
          {post.category && (
            <span className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full">
              {post.category}
            </span>
          )}
          {post.publishedAt && (
            <span className="text-slate-500 text-sm">
              {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
            </span>
          )}
        </div>

        <h1 className="font-serif text-4xl md:text-6xl text-slate-900 dark:text-white mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          {post.excerpt}
        </p>
      </div>

      {post.featuredImageUrl && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative h-64 md:h-[500px] rounded-2xl overflow-hidden">
            <Image src={post.featuredImageUrl} alt={post.featuredImageAlt} fill className="object-cover" priority />
          </div>
          {attribution?.photographer && (
            <p className="mt-3 text-xs text-fg-muted text-center">
              © {attribution.photographer}
              {attribution.source && attribution.source_url && (
                <>
                  {' · '}
                  <a href={attribution.source_url} target="_blank" rel="noreferrer" className="hover:text-brand underline decoration-dotted">
                    {attribution.source}
                  </a>
                </>
              )}
              {attribution.source && !attribution.source_url && ` · ${attribution.source}`}
            </p>
          )}
        </div>
      )}

      {/* Post body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-brand"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Author card */}
        <div className="mt-16 p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <p className="text-brand text-sm uppercase tracking-widest mb-2">Written by</p>
          <h3 className="font-serif text-2xl text-slate-900 dark:text-white mb-2">Bodo Desderio</h3>
          <p className="text-slate-600 dark:text-slate-300">
            Founder & CEO of Rooibok Technologies. Software Engineer at Kakebe Technologies. Former President, African Youth Congress Uganda Chapter.
          </p>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl text-slate-900 dark:text-white mb-8">Related posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                  <h3 className="font-serif text-lg text-slate-900 dark:text-white group-hover:text-brand transition-colors mb-2">
                    {r.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{r.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Link href="/blog" className="inline-flex items-center text-brand hover:underline font-medium">
            ← Back to blog
          </Link>
        </div>
      </div>
    </article>
  )
}
