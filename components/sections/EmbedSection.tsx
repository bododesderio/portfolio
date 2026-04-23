import { prisma } from '@/lib/db'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface EmbedSectionProps {
  page: string
  section: string
  title?: string
  subtitle?: string
  layout?: 'masonry' | 'carousel' | 'featured'
}

const embedHtml: Record<string, (postId: string, url: string) => string> = {
  twitter: (_, url) =>
    `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`,
  youtube: (postId) =>
    `<iframe src="https://www.youtube.com/embed/${postId}" class="w-full aspect-video rounded-xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
  vimeo: (postId) =>
    `<iframe src="https://player.vimeo.com/video/${postId}" class="w-full aspect-video rounded-xl" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`,
  instagram: (_, url) =>
    `<blockquote class="instagram-media" data-instgrm-permalink="${url}" style="max-width:540px;width:100%"></blockquote>`,
  linkedin: (_, url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block p-4 border border-hairline rounded-xl hover:bg-muted transition-colors"><span class="text-sm text-fg-muted">View on LinkedIn →</span></a>`,
  facebook: (_, url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block p-4 border border-hairline rounded-xl hover:bg-muted transition-colors"><span class="text-sm text-fg-muted">View on Facebook →</span></a>`,
  tiktok: (_, url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block p-4 border border-hairline rounded-xl hover:bg-muted transition-colors"><span class="text-sm text-fg-muted">View on TikTok →</span></a>`,
}

const layoutClasses: Record<string, string> = {
  masonry: 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6',
  carousel: 'flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide',
  featured: 'grid grid-cols-1 md:grid-cols-2 gap-6',
}

export async function EmbedSection({ page, section, title, subtitle, layout = 'masonry' }: EmbedSectionProps) {
  const embeds = await prisma.pageEmbed.findMany({
    where: { page, section, isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })

  if (embeds.length === 0) return null

  return (
    <Section>
      <Container>
        {title && (
          <div className="text-center mb-12">
            <Eyebrow className="mb-2">{section.replace(/-/g, ' ')}</Eyebrow>
            <h2 className="font-serif text-3xl md:text-4xl text-fg mb-3">{title}</h2>
            {subtitle && <p className="text-lg text-fg-muted max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        <div className={layoutClasses[layout] || layoutClasses.masonry}>
          {embeds.map((embed) => {
            const renderer = embedHtml[embed.platform]
            const html = renderer
              ? renderer(embed.postId, embed.originalUrl)
              : `<a href="${embed.originalUrl}" target="_blank" rel="noopener noreferrer" class="text-brand hover:underline">View post →</a>`

            return (
              <div
                key={embed.id}
                className={`${layout === 'carousel' ? 'snap-start flex-shrink-0 w-[85vw] sm:w-[400px]' : 'break-inside-avoid'}`}
              >
                <div
                  className="rounded-xl overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
                {embed.caption && (
                  <p className="mt-2 text-sm text-fg-muted">{embed.caption}</p>
                )}
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
