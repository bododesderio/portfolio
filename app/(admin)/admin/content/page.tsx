import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export const metadata = { title: 'Pages — Admin' }
export const dynamic = 'force-dynamic'

const PAGES = [
  { slug: 'home',     label: 'Home' },
  { slug: 'about',    label: 'About' },
  { slug: 'services', label: 'Services' },
  { slug: 'gallery',  label: 'Gallery' },
  { slug: 'blog',     label: 'Blog' },
  { slug: 'contact',  label: 'Contact' },
  { slug: 'global',   label: 'Global (footer, etc.)' },
]

export default async function PagesIndex() {
  const counts = await prisma.siteContent
    .groupBy({ by: ['page'], _count: { _all: true } })
    .catch(() => [] as Array<{ page: string; _count: { _all: number } }>)

  const countMap = new Map(counts.map(c => [c.page, c._count._all]))

  return (
    <div>
      <AdminPageHeader
        title="Pages"
        description="Edit copy and content for every page on the public site. Changes go live as soon as you save."
      />
      <div className="grid sm:grid-cols-2 gap-4">
        {PAGES.map(p => {
          const n = countMap.get(p.slug) ?? 0
          return (
            <Link
              key={p.slug}
              href={`/admin/content/${p.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-card p-5 hover:border-brand/40 transition-colors"
            >
              <div>
                <p className="font-serif text-base text-fg capitalize">{p.label}</p>
                <p className="text-xs text-fg-muted mt-0.5">{n} editable fields</p>
              </div>
              <ArrowRight className="h-4 w-4 text-fg-muted group-hover:text-brand transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
