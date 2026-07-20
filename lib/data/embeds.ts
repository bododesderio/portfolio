import { prisma } from '@/lib/data/db'

/**
 * Published embeds for a page section, in display order.
 *
 * Lives here rather than inside the component so components/ has no direct
 * Prisma dependency — it was the only remaining place where a component
 * reached past the data layer.
 */
export async function getPublishedEmbeds(page: string, section: string) {
  return prisma.pageEmbed.findMany({
    where: { page, section, isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export type PublishedEmbed = Awaited<ReturnType<typeof getPublishedEmbeds>>[number]
