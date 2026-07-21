import { getPublishedEmbeds } from '@/lib/data/embeds'
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

function safeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    return parsed.toString()
  } catch {
    return null
  }
}

function renderEmbed(embed: { platform: string; postId: string; originalUrl: string }) {
  const url = safeExternalUrl(embed.originalUrl)
  if (!url) return null
  const postId = encodeURIComponent(embed.postId)

  switch (embed.platform) {
    case 'twitter':
      return <blockquote className="twitter-tweet"><a href={url} /></blockquote>
    case 'youtube':
      return (
        <iframe
          src={`https://www.youtube.com/embed/${postId}`}
          title="YouTube embed"
          className="w-full aspect-video rounded-xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    case 'vimeo':
      return (
        <iframe
          src={`https://player.vimeo.com/video/${postId}`}
          title="Vimeo embed"
          className="w-full aspect-video rounded-xl"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )
    case 'instagram':
      return <blockquote className="instagram-media" data-instgrm-permalink={url} style={{ maxWidth: 540, width: '100%' }} />
    case 'linkedin':
    case 'facebook':
    case 'tiktok': {
      const label = embed.platform[0].toUpperCase() + embed.platform.slice(1)
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-hairline rounded-xl hover:bg-muted transition-colors">
          <span className="text-sm text-fg-muted">View on {label} →</span>
        </a>
      )
    }
    default:
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
          View post →
        </a>
      )
  }
}

const layoutClasses: Record<string, string> = {
  masonry: 'columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6',
  carousel: 'flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide',
  featured: 'grid grid-cols-1 md:grid-cols-2 gap-6',
}

export async function EmbedSection({ page, section, title, subtitle, layout = 'masonry' }: EmbedSectionProps) {
  const embeds = await getPublishedEmbeds(page, section)

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
            const rendered = renderEmbed(embed)
            if (!rendered) return null

            return (
              <div
                key={embed.id}
                className={`${layout === 'carousel' ? 'snap-start flex-shrink-0 w-[85vw] sm:w-[400px]' : 'break-inside-avoid'}`}
              >
                <div className="rounded-xl overflow-hidden">
                  {rendered}
                </div>
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
