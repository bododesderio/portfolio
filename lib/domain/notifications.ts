import { prisma } from '@/lib/data/db'
import { sendTrackedEmail } from '@/lib/domain/email-tracking'
import { renderNewPostNotification } from '@/lib/emails'
import { unsubscribeUrl } from '@/lib/domain/unsubscribe'

export async function notifySubscribersOfPost(post: { title: string; slug: string; excerpt: string }) {
  try {
    const subscribers = await prisma.subscriber.findMany({ where: { confirmed: true } })
    if (subscribers.length === 0) return 0

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://bododesderio.com'
    const postUrl = `${siteUrl}/blog/${post.slug}`

    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (subscriber) => {
          const html = await renderNewPostNotification({
            title: post.title,
            excerpt: post.excerpt,
            url: postUrl,
            unsubscribeUrl: unsubscribeUrl(subscriber.email),
          })
          return sendTrackedEmail({
            to: subscriber.email,
            subject: `New post: ${post.title}`,
            html,
            type: 'new_post',
          }).catch((err) => {
            console.error(`[Notify] Failed to send to ${subscriber.email}:`, (err as Error).message)
            return null
          })
        })
      )
    }

    return subscribers.length
  } catch (err) {
    console.error('[Notify] Error notifying subscribers:', err)
    return 0
  }
}
