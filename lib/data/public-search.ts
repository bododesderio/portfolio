import { prisma } from '@/lib/data/db'
import {
  readTimeline,
  readDatedEntries,
  readStringList,
  readValues,
} from '@/lib/domain/profile'

export type PublicSearchResult = {
  title: string
  excerpt: string
  href: string
  kind: 'Biography' | 'Work' | 'Writing' | 'Page'
}
export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').slice(0, 120)
}
function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
function excerpt(value: string, query: string) {
  const text = plainText(value)
  const position = text.toLowerCase().indexOf(query.toLowerCase())
  const start = Math.max(0, position - 60)
  return `${start ? '…' : ''}${text.slice(start, start + 180)}${text.length > start + 180 ? '…' : ''}`
}
const sections = [
  {
    page: 'home',
    section: 'about',
    fieldKey: { in: ['paragraph_1', 'paragraph_2', 'paragraph_3'] },
  },
  { page: 'home', section: 'bio', fieldKey: 'body' },
  { page: 'home', section: 'community', fieldKey: 'body' },
  { page: 'about', section: 'story', fieldKey: 'items' },
  {
    page: 'about',
    section: { in: ['education', 'volunteering', 'skills', 'languages'] },
    fieldKey: 'items',
  },
  { page: 'about', section: 'interests', fieldKey: 'body' },
]
const pages = [
  {
    title: 'About Bodo Desderio',
    excerpt:
      'Biography, education, career, history, community, and personal interests.',
    href: '/about',
  },
  {
    title: 'Work & ventures',
    excerpt: 'Companies, projects, and software I have worked on.',
    href: '/projects',
  },
  {
    title: 'Writing',
    excerpt: 'Essays and notes on technology, leadership, and life.',
    href: '/blog',
  },
  {
    title: 'Photographs',
    excerpt: 'The people, places, and moments in my personal gallery.',
    href: '/gallery',
  },
  {
    title: 'Contact',
    excerpt: 'Email, social profiles, and ways to get in touch.',
    href: '/contact',
  },
]

export async function searchPublicContent(
  rawQuery: string
): Promise<PublicSearchResult[]> {
  const query = normalizeSearchQuery(rawQuery)
  if (query.length < 2) return []
  const contains = { contains: query, mode: 'insensitive' as const }
  const [posts, projects, content] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        status: 'published',
        OR: [{ title: contains }, { excerpt: contains }, { body: contains }],
      },
      select: { title: true, slug: true, excerpt: true, body: true },
      take: 6,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.project.findMany({
      where: {
        visible: true,
        OR: [{ title: contains }, { excerpt: contains }, { body: contains }],
      },
      select: { title: true, slug: true, excerpt: true, body: true },
      take: 6,
      orderBy: { order: 'asc' },
    }),
    prisma.siteContent.findMany({
      where: { OR: sections, value: contains },
      select: { page: true, section: true, fieldKey: true, value: true },
      take: 16,
    }),
  ])
  const biographies: PublicSearchResult[] = content.flatMap((row) => {
    if (row.section === 'education' || row.section === 'volunteering')
      return readDatedEntries(row.value)
        .filter((item) =>
          `${item.title} ${item.organization} ${item.period} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .map((item) => ({
          title: item.title,
          excerpt: [item.organization, item.period, item.description]
            .filter(Boolean)
            .join(' · '),
          href: `/about#${row.section}`,
          kind: 'Biography' as const,
        }))
    if (row.section === 'skills' || row.section === 'languages') {
      const text =
        row.section === 'skills'
          ? readStringList(row.value).join(' · ')
          : readValues(row.value)
              .map((item) => `${item.title}: ${item.description}`)
              .join(' · ')
      return [
        {
          title: 'Skills & languages',
          excerpt: excerpt(text, query),
          href: '/about#skills',
          kind: 'Biography' as const,
        },
      ]
    }
    if (row.section === 'story')
      return readTimeline(row.value)
        .filter((item) =>
          `${item.year} ${item.title} ${item.organization} ${item.description}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .map((item) => ({
          title: [item.year, item.title].filter(Boolean).join(' · '),
          excerpt: excerpt(item.description || item.organization || '', query),
          href: '/about#timeline',
          kind: 'Biography' as const,
        }))
    return [
      {
        title:
          row.section === 'community'
            ? 'Community & public life'
            : 'Biography · Bodo Desderio',
        excerpt: excerpt(row.value, query),
        href:
          row.section === 'community' ? '/about#community' : '/about#biography',
        kind: 'Biography' as const,
      },
    ]
  })
  const results: PublicSearchResult[] = [
    ...pages
      .filter((page) =>
        `${page.title} ${page.excerpt}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      .map((page) => ({ ...page, kind: 'Page' as const })),
    ...biographies,
    ...projects.map((project) => ({
      title: project.title,
      excerpt: excerpt(`${project.excerpt} ${project.body}`, query),
      href: `/projects/${project.slug}`,
      kind: 'Work' as const,
    })),
    ...posts.map((post) => ({
      title: post.title,
      excerpt: excerpt(`${post.excerpt} ${post.body}`, query),
      href: `/blog/${post.slug}`,
      kind: 'Writing' as const,
    })),
  ]
  const seen = new Set<string>()
  return results
    .filter((result) => {
      const key = `${result.href}:${result.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 18)
}
