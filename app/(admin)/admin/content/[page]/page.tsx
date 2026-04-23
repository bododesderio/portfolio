import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ContentEditor } from '@/components/admin/ContentEditor'
import { EmbedManager } from '@/components/admin/EmbedManager'
import type { Metadata } from 'next'

const EDITABLE_PAGES = ['home', 'about', 'services', 'gallery', 'blog', 'contact', 'global']
const EMBED_PAGES = ['home', 'about', 'services', 'contact']

interface Props { params: Promise<{ page: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params
  return { title: `Edit ${page} — Admin` }
}

export default async function ContentEditorPage({ params }: Props) {
  const { page } = await params
  if (!EDITABLE_PAGES.includes(page)) notFound()

  const [rows, embeds] = await Promise.all([
    prisma.siteContent.findMany({
      where: { page },
      orderBy: [{ section: 'asc' }, { fieldKey: 'asc' }],
    }),
    EMBED_PAGES.includes(page)
      ? prisma.pageEmbed.findMany({
          where: { page },
          orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
        })
      : Promise.resolve([]),
  ])

  return (
    <div>
      <h1 className="font-serif text-3xl text-fg mb-2 capitalize">
        {page} — Content
      </h1>
      <p className="text-ink-500 text-sm mb-8">
        Changes are saved individually and go live instantly.
      </p>
      <ContentEditor page={page} initialRows={rows} />

      {EMBED_PAGES.includes(page) && (
        <div className="mt-12 pt-8 border-t border-hairline">
          <h2 className="font-serif text-2xl text-fg mb-2">Embeds</h2>
          <p className="text-ink-500 text-sm mb-6">
            Social media posts embedded on the public {page} page.
          </p>
          <EmbedManager page={page} initialEmbeds={embeds} />
        </div>
      )}
    </div>
  )
}
