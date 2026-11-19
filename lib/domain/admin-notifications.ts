import { basePrisma } from '@/lib/data/db'

export const NOTIFICATION_TYPES = ['message', 'subscriber', 'error', 'maintenance', 'newsletter'] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  message: 'Messages',
  subscriber: 'Subscribers',
  error: 'Errors',
  maintenance: 'Maintenance',
  newsletter: 'Newsletter',
}

/**
 * Adds an item to the admin feed. Never throws: a notification failing must not
 * fail the visitor's contact form or subscription that triggered it.
 */
export async function notifyAdmin(entry: {
  type: NotificationType
  title: string
  body?: string
  href?: string
}) {
  try {
    await basePrisma.adminNotification.create({
      data: {
        type: entry.type,
        title: entry.title.slice(0, 200),
        body: entry.body?.slice(0, 500),
        href: entry.href,
      },
    })
  } catch (error) {
    console.error('[notifications] could not store', entry.type, error)
  }
}

export function unreadNotificationCount() {
  return basePrisma.adminNotification.count({ where: { readAt: null } })
}
