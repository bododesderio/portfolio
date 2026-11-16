import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/data/db'
import {
  EntryHeading,
  EntryLayout,
  EntrySection,
} from '@/components/personal/EntryLayout'
import { RichText, WritingRows } from '@/components/personal/ProfileContent'
import { ldJson, breadcrumbList } from '@/lib/schema'
import { safePublicHref } from '@/lib/domain/profile'
export const dynamic = 'force-dynamic'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bododesderio.com'
interface Props {
  params: Promise<{ slug: string }>
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'published' },
  })
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: post.featuredImageUrl
        ? [{ url: post.featuredImageUrl }]
        : undefined,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['Bodo Desderio'],
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image' },
  }
}
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: 'published' },
  })
  if (!post) notFound()
  const related = await prisma.blogPost.findMany({
    where: { status: 'published', id: { not: post.id } },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: 2,
  })
  const date = post.publishedAt ?? post.createdAt
  const attribution = post.featuredImageAttribution as {
    photographer?: string
    source?: string
    source_url?: string
  } | null
  const sourceUrl = safePublicHref(attribution?.source_url || '')
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    datePublished: date.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#bodo`,
      name: 'Bodo Desderio',
      url: `${SITE_URL}/about`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category ?? undefined,
  }
  return (
    <EntryLayout
      contents={[
        { id: 'article', label: 'The essay' },
        ...(related.length ? [{ id: 'related', label: 'Keep reading' }] : []),
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson([
            schema,
            {
              '@context': 'https://schema.org',
              ...breadcrumbList([
                { name: 'Home', url: SITE_URL },
                { name: 'Writing', url: `${SITE_URL}/blog` },
                { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
              ]),
            },
          ]),
        }}
      />
      <Link href="/blog" className="personal-inline-link">
        ← Back to writing
      </Link>
      <EntryHeading
        eyebrow={post.category || 'From my notebook'}
        title={post.title}
        description={post.excerpt}
      />
      <div className="personal-detail-meta">
        <Link href="/about">Bodo Desderio</Link>
        <time dateTime={date.toISOString()}>
          {date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </time>
      </div>
      {post.featuredImageUrl && (
        <>
          <figure className="personal-detail-image">
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt || post.title}
              fill
              priority
              sizes="(max-width: 760px) 90vw, 850px"
              className="object-cover"
            />
          </figure>
          {attribution && (
            <p className="personal-detail-image-caption">
              {attribution.photographer && (
                <>Photo by {attribution.photographer} </>
              )}
              {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                  {attribution.source || 'Image source'} ↗
                </a>
              ) : (
                attribution.source
              )}
            </p>
          )}
        </>
      )}
      <div className="personal-article-body" id="article">
        <RichText html={post.body} />
      </div>
      {related.length > 0 && (
        <EntrySection id="related" title="Keep reading">
          <WritingRows items={related} />
        </EntrySection>
      )}
    </EntryLayout>
  )
}
